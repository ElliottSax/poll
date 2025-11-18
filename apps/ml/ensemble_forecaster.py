"""
Ensemble Forecasting Model
Combines multiple forecasting methods for improved accuracy and robustness
"""

import logging
import asyncio
import numpy as np
from typing import List, Dict, Optional, Any, Tuple
from datetime import datetime, timedelta
import httpx
from scipy import stats

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class EnsembleForecaster:
    """
    Ensemble forecasting model that combines:
    1. Monte Carlo simulation (from forecaster.py)
    2. Exponentially Weighted Moving Average (EWMA)
    3. Bayesian updating
    4. Historical polling patterns

    Uses model averaging and confidence weighting to generate robust forecasts
    """

    def __init__(
        self,
        api_base_url: str = "http://localhost:3001",
        n_simulations: int = 10000,
    ):
        self.api_base_url = api_base_url
        self.n_simulations = n_simulations
        self.client = httpx.AsyncClient(timeout=30.0)

        # Model weights (can be tuned based on historical performance)
        self.weights = {
            'monte_carlo': 0.40,
            'ewma': 0.25,
            'bayesian': 0.20,
            'historical': 0.15,
        }

    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()

    async def fetch_poll_history(
        self,
        race_slug: str,
        days_back: int = 90
    ) -> List[Dict[str, Any]]:
        """
        Fetch historical polls for trend analysis

        Args:
            race_slug: Race identifier
            days_back: Number of days of history to fetch

        Returns:
            List of polls with dates and results
        """
        try:
            response = await self.client.get(
                f"{self.api_base_url}/api/races/{race_slug}/polls"
            )
            response.raise_for_status()
            data = response.json()
            polls = data.get('polls', [])

            # Filter by date
            cutoff = datetime.now() - timedelta(days=days_back)
            recent_polls = [
                p for p in polls
                if datetime.fromisoformat(p['endDate'].replace('Z', '+00:00')) > cutoff
            ]

            return recent_polls

        except Exception as e:
            logger.error(f"Failed to fetch poll history: {e}")
            return []

    def compute_monte_carlo(
        self,
        candidate_averages: List[Dict[str, Any]],
        polling_error_std: float = 3.5
    ) -> Dict[str, Dict[str, float]]:
        """
        Monte Carlo simulation component

        Args:
            candidate_averages: List of candidate polling averages
            polling_error_std: Standard deviation for polling error

        Returns:
            Dict mapping candidate_id to prediction stats
        """
        results = {}

        for _ in range(self.n_simulations):
            for cand in candidate_averages:
                cand_id = cand['candidate_id']
                poll_avg = cand['weighted_average']
                poll_std = cand.get('std_dev', 2.0)

                # Combined uncertainty
                total_std = np.sqrt(poll_std**2 + polling_error_std**2)

                # Sample result
                result = np.random.normal(poll_avg, total_std)
                result = max(0, min(100, result))

                if cand_id not in results:
                    results[cand_id] = []
                results[cand_id].append(result)

        # Calculate statistics
        stats_results = {}
        for cand_id, values in results.items():
            stats_results[cand_id] = {
                'mean': np.mean(values),
                'std': np.std(values),
                'median': np.median(values),
                'p5': np.percentile(values, 5),
                'p95': np.percentile(values, 95),
            }

        return stats_results

    def compute_ewma(
        self,
        poll_history: List[Dict[str, Any]],
        alpha: float = 0.3
    ) -> Dict[str, float]:
        """
        Exponentially Weighted Moving Average component

        Args:
            poll_history: Historical poll data
            alpha: Smoothing parameter (0 < alpha <= 1)

        Returns:
            Dict mapping candidate_id to EWMA prediction
        """
        # Group polls by candidate
        candidate_series: Dict[str, List[Tuple[datetime, float]]] = {}

        for poll in poll_history:
            poll_date = datetime.fromisoformat(poll['endDate'].replace('Z', '+00:00'))
            results = poll.get('results', [])

            for result in results:
                cand_id = result.get('candidateId')
                value = result.get('value', 0)

                if cand_id:
                    if cand_id not in candidate_series:
                        candidate_series[cand_id] = []
                    candidate_series[cand_id].append((poll_date, value))

        # Calculate EWMA for each candidate
        ewma_forecasts = {}

        for cand_id, series in candidate_series.items():
            # Sort by date
            series_sorted = sorted(series, key=lambda x: x[0])

            if not series_sorted:
                continue

            # Apply exponential weighting
            ewma = series_sorted[0][1]  # Initialize with first value

            for _, value in series_sorted[1:]:
                ewma = alpha * value + (1 - alpha) * ewma

            ewma_forecasts[cand_id] = ewma

        return ewma_forecasts

    def compute_bayesian(
        self,
        candidate_averages: List[Dict[str, Any]],
        prior_mean: float = 50.0,
        prior_std: float = 10.0
    ) -> Dict[str, Dict[str, float]]:
        """
        Bayesian updating component with informative priors

        Args:
            candidate_averages: Current polling averages
            prior_mean: Prior belief about vote share
            prior_std: Uncertainty in prior belief

        Returns:
            Dict mapping candidate_id to posterior estimates
        """
        bayesian_results = {}

        for cand in candidate_averages:
            cand_id = cand['candidate_id']
            poll_mean = cand['weighted_average']
            poll_std = cand.get('std_dev', 2.0)
            n_polls = cand.get('poll_count', 1)

            # Bayesian update: combine prior with likelihood
            # Posterior precision = prior precision + likelihood precision
            prior_precision = 1 / (prior_std ** 2)
            likelihood_precision = n_polls / (poll_std ** 2)

            posterior_precision = prior_precision + likelihood_precision
            posterior_variance = 1 / posterior_precision

            # Posterior mean is precision-weighted average
            posterior_mean = (
                (prior_precision * prior_mean + likelihood_precision * poll_mean)
                / posterior_precision
            )

            bayesian_results[cand_id] = {
                'mean': posterior_mean,
                'std': np.sqrt(posterior_variance),
            }

        return bayesian_results

    def compute_historical_adjustment(
        self,
        poll_history: List[Dict[str, Any]],
        candidate_id: str,
        current_avg: float
    ) -> float:
        """
        Compute adjustment based on historical polling patterns

        Analyzes late-campaign trends and systematic biases

        Args:
            poll_history: Historical polls
            candidate_id: Candidate to analyze
            current_avg: Current polling average

        Returns:
            Adjusted forecast
        """
        # Extract time series for this candidate
        series = []

        for poll in poll_history:
            poll_date = datetime.fromisoformat(poll['endDate'].replace('Z', '+00:00'))
            results = poll.get('results', [])

            for result in results:
                if result.get('candidateId') == candidate_id:
                    days_to_election = (datetime.now() - poll_date).days
                    value = result.get('value', 0)
                    series.append((days_to_election, value))

        if len(series) < 3:
            return current_avg  # Not enough data for trend analysis

        # Sort by recency (most recent first)
        series_sorted = sorted(series, key=lambda x: x[0])

        # Simple linear regression to detect trend
        x = np.array([s[0] for s in series_sorted])
        y = np.array([s[1] for s in series_sorted])

        if len(x) > 1:
            slope, intercept, _, _, _ = stats.linregress(x, y)

            # Project trend to election day (days_to_election = 0)
            projected = intercept

            # Blend current average with trend projection
            adjusted = 0.7 * current_avg + 0.3 * projected

            return adjusted

        return current_avg

    async def generate_ensemble_forecast(
        self,
        race_slug: str
    ) -> Optional[Dict[str, Any]]:
        """
        Generate ensemble forecast combining all models

        Args:
            race_slug: Race identifier

        Returns:
            Complete ensemble forecast with confidence intervals
        """
        logger.info(f"Generating ensemble forecast for: {race_slug}")

        # Fetch poll data
        poll_history = await self.fetch_poll_history(race_slug)

        if not poll_history:
            logger.warning(f"No poll data for race: {race_slug}")
            return None

        # Aggregate current polls (simple average for now)
        candidate_totals: Dict[str, List[float]] = {}

        for poll in poll_history[:20]:  # Use last 20 polls
            results = poll.get('results', [])
            for result in results:
                cand_id = result.get('candidateId')
                value = result.get('value', 0)
                if cand_id:
                    if cand_id not in candidate_totals:
                        candidate_totals[cand_id] = []
                    candidate_totals[cand_id].append(value)

        # Calculate current averages
        candidate_averages = []
        for cand_id, values in candidate_totals.items():
            candidate_averages.append({
                'candidate_id': cand_id,
                'weighted_average': np.mean(values),
                'std_dev': np.std(values) if len(values) > 1 else 2.0,
                'poll_count': len(values),
            })

        # Run all models
        mc_results = self.compute_monte_carlo(candidate_averages)
        ewma_results = self.compute_ewma(poll_history)
        bayesian_results = self.compute_bayesian(candidate_averages)

        # Combine models using weighted average
        ensemble_results = []

        for cand in candidate_averages:
            cand_id = cand['candidate_id']

            # Get predictions from each model
            mc_pred = mc_results.get(cand_id, {}).get('mean', cand['weighted_average'])
            ewma_pred = ewma_results.get(cand_id, cand['weighted_average'])
            bayes_pred = bayesian_results.get(cand_id, {}).get('mean', cand['weighted_average'])
            hist_pred = self.compute_historical_adjustment(
                poll_history,
                cand_id,
                cand['weighted_average']
            )

            # Weighted ensemble
            ensemble_mean = (
                self.weights['monte_carlo'] * mc_pred +
                self.weights['ewma'] * ewma_pred +
                self.weights['bayesian'] * bayes_pred +
                self.weights['historical'] * hist_pred
            )

            # Ensemble uncertainty (average of model uncertainties)
            mc_std = mc_results.get(cand_id, {}).get('std', 3.5)
            bayes_std = bayesian_results.get(cand_id, {}).get('std', 3.5)
            ensemble_std = (mc_std + bayes_std) / 2

            # Calculate win probability from simulations
            # Run mini simulation with ensemble parameters
            wins = 0
            for _ in range(1000):
                sample = np.random.normal(ensemble_mean, ensemble_std)
                if sample > 50:  # Simplified - assumes 2-candidate race
                    wins += 1

            win_prob = (wins / 1000) * 100

            ensemble_results.append({
                'candidate_id': cand_id,
                'ensemble_mean': round(ensemble_mean, 2),
                'ensemble_std': round(ensemble_std, 2),
                'win_probability': round(win_prob, 2),
                'percentile_5': round(ensemble_mean - 1.645 * ensemble_std, 2),
                'percentile_95': round(ensemble_mean + 1.645 * ensemble_std, 2),
                'model_contributions': {
                    'monte_carlo': round(mc_pred, 2),
                    'ewma': round(ewma_pred, 2),
                    'bayesian': round(bayes_pred, 2),
                    'historical': round(hist_pred, 2),
                },
            })

        # Sort by ensemble mean
        ensemble_results.sort(key=lambda x: x['ensemble_mean'], reverse=True)

        forecast = {
            'race_slug': race_slug,
            'forecast_date': datetime.now().isoformat(),
            'model_type': 'ensemble',
            'model_version': '2.0.0',
            'results': ensemble_results,
            'methodology': {
                'type': 'ensemble',
                'models': list(self.weights.keys()),
                'model_weights': self.weights,
                'total_polls': len(poll_history),
            },
            'data_quality': {
                'polls_used': len(poll_history[:20]),
                'days_of_history': 90,
                'last_updated': datetime.now().isoformat(),
            },
        }

        logger.info(f"Ensemble forecast complete for {race_slug}")
        return forecast


# For testing standalone
async def main():
    forecaster = EnsembleForecaster()

    try:
        forecast = await forecaster.generate_ensemble_forecast("2024-presidential")

        if forecast:
            logger.info("Ensemble Forecast Results:")
            for result in forecast['results']:
                logger.info(
                    f"  Candidate {result['candidate_id']}: "
                    f"{result['ensemble_mean']}% ± {result['ensemble_std']}% "
                    f"(Win prob: {result['win_probability']}%)"
                )
                logger.info(f"    Model contributions: {result['model_contributions']}")
        else:
            logger.warning("No forecast generated")

    finally:
        await forecaster.close()


if __name__ == "__main__":
    asyncio.run(main())
