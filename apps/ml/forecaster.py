"""
Monte Carlo Forecasting Model
Simulates election outcomes using poll data and historical uncertainty
"""

import logging
import asyncio
import numpy as np
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
import httpx

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class MonteCarloForecaster:
    """
    Monte Carlo simulation-based election forecaster

    Uses poll aggregation data and historical polling error to generate
    probabilistic forecasts through repeated simulation.
    """

    def __init__(
        self,
        api_base_url: str = "http://localhost:3001",
        n_simulations: int = 10000,
        polling_error_std: float = 3.5,  # Historical average polling error
    ):
        self.api_base_url = api_base_url
        self.n_simulations = n_simulations
        self.polling_error_std = polling_error_std
        self.client = httpx.AsyncClient(timeout=30.0)

    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()

    async def fetch_race_aggregation(self, race_slug: str) -> Optional[Dict[str, Any]]:
        """
        Fetch aggregated poll data for a race

        Args:
            race_slug: Race identifier

        Returns:
            Aggregation data with candidate averages
        """
        try:
            # In production, this would call the aggregator service
            # For now, we'll fetch polls and compute simple average
            response = await self.client.get(
                f"{self.api_base_url}/api/races/{race_slug}/polls"
            )
            response.raise_for_status()
            data = response.json()
            polls = data.get('polls', [])

            if not polls:
                return None

            # Simple average for demonstration
            # In production, use the sophisticated aggregator
            candidate_totals: Dict[str, List[float]] = {}

            for poll in polls[:20]:  # Use last 20 polls
                results = poll.get('results', [])
                for result in results:
                    candidate_id = result.get('candidateId')
                    value = result.get('value', 0)
                    if candidate_id:
                        if candidate_id not in candidate_totals:
                            candidate_totals[candidate_id] = []
                        candidate_totals[candidate_id].append(value)

            # Calculate averages
            aggregated_results = []
            for candidate_id, values in candidate_totals.items():
                aggregated_results.append({
                    'candidate_id': candidate_id,
                    'weighted_average': np.mean(values),
                    'std_dev': np.std(values),
                    'poll_count': len(values)
                })

            return {
                'race_slug': race_slug,
                'aggregated_results': aggregated_results,
                'total_polls': len(polls)
            }

        except Exception as e:
            logger.error(f"Failed to fetch race aggregation for {race_slug}: {e}")
            return None

    def simulate_election(
        self,
        candidate_averages: List[Dict[str, Any]],
        n_sims: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Run Monte Carlo simulation for election outcome

        Args:
            candidate_averages: List of candidate polling averages
            n_sims: Number of simulations (default: self.n_simulations)

        Returns:
            Simulation results with win probabilities
        """
        if n_sims is None:
            n_sims = self.n_simulations

        # Extract candidate data
        candidates = []
        for cand in candidate_averages:
            candidates.append({
                'id': cand['candidate_id'],
                'poll_average': cand['weighted_average'],
                'poll_std': cand.get('std_dev', 2.0),  # Default uncertainty
            })

        # Run simulations
        results = {cand['id']: [] for cand in candidates}
        wins = {cand['id']: 0 for cand in candidates}

        for _ in range(n_sims):
            # Sample from normal distribution for each candidate
            simulated_results = {}

            for cand in candidates:
                # Combine poll uncertainty and systematic error
                total_std = np.sqrt(
                    cand['poll_std']**2 + self.polling_error_std**2
                )

                # Sample result
                result = np.random.normal(
                    cand['poll_average'],
                    total_std
                )

                # Ensure non-negative and bounded by 100
                result = max(0, min(100, result))
                simulated_results[cand['id']] = result
                results[cand['id']].append(result)

            # Determine winner
            winner_id = max(simulated_results, key=simulated_results.get)
            wins[winner_id] += 1

        # Calculate statistics
        forecast_results = []
        for cand in candidates:
            cand_results = results[cand['id']]
            forecast_results.append({
                'candidate_id': cand['id'],
                'win_probability': round((wins[cand['id']] / n_sims) * 100, 2),
                'mean_vote_share': round(np.mean(cand_results), 2),
                'median_vote_share': round(np.median(cand_results), 2),
                'std_dev': round(np.std(cand_results), 2),
                'percentile_5': round(np.percentile(cand_results, 5), 2),
                'percentile_95': round(np.percentile(cand_results, 95), 2),
            })

        # Sort by win probability
        forecast_results.sort(key=lambda x: x['win_probability'], reverse=True)

        return {
            'simulations': n_sims,
            'results': forecast_results,
            'methodology': {
                'type': 'monte_carlo',
                'polling_error_std': self.polling_error_std,
                'adjustments': ['polling_error', 'sample_uncertainty']
            }
        }

    async def forecast_race(self, race_slug: str) -> Optional[Dict[str, Any]]:
        """
        Generate complete forecast for a race

        Args:
            race_slug: Race identifier

        Returns:
            Complete forecast with probabilities and metadata
        """
        logger.info(f"Generating forecast for race: {race_slug}")

        # Fetch aggregated poll data
        aggregation = await self.fetch_race_aggregation(race_slug)

        if not aggregation or not aggregation.get('aggregated_results'):
            logger.warning(f"No poll data available for race: {race_slug}")
            return None

        # Run Monte Carlo simulation
        simulation = self.simulate_election(aggregation['aggregated_results'])

        # Compile full forecast
        forecast = {
            'race_slug': race_slug,
            'forecast_date': datetime.now().isoformat(),
            'model_version': '1.0.0',
            'simulations': simulation['simulations'],
            'results': simulation['results'],
            'methodology': simulation['methodology'],
            'data_quality': {
                'total_polls': aggregation['total_polls'],
                'last_updated': datetime.now().isoformat(),
            }
        }

        logger.info(f"Forecast complete for {race_slug}: "
                   f"{len(simulation['results'])} candidates")

        return forecast

    async def forecast_all_races(self) -> List[Dict[str, Any]]:
        """
        Generate forecasts for all active races

        Returns:
            List of race forecasts
        """
        logger.info("Generating forecasts for all races")

        try:
            # Fetch all races
            response = await self.client.get(f"{self.api_base_url}/api/races")
            response.raise_for_status()
            data = response.json()
            races = data.get('races', [])

            logger.info(f"Found {len(races)} races to forecast")

            # Forecast each race
            forecasts = []
            for race in races:
                race_slug = race.get('slug')
                if race_slug:
                    forecast = await self.forecast_race(race_slug)
                    if forecast:
                        forecasts.append(forecast)
                    await asyncio.sleep(0.5)  # Rate limiting

            logger.info(f"Generated {len(forecasts)} forecasts")
            return forecasts

        except Exception as e:
            logger.error(f"Failed to forecast all races: {e}")
            return []


# For testing standalone
async def main():
    forecaster = MonteCarloForecaster(n_simulations=10000)

    try:
        # Test with a specific race
        forecast = await forecaster.forecast_race("2024-presidential")

        if forecast:
            logger.info("Forecast Results:")
            for result in forecast['results']:
                logger.info(
                    f"  Candidate {result['candidate_id']}: "
                    f"{result['win_probability']}% win probability, "
                    f"{result['mean_vote_share']}% vote share"
                )
        else:
            logger.warning("No forecast generated")

        # Or forecast all races
        # forecasts = await forecaster.forecast_all_races()
        # logger.info(f"Generated {len(forecasts)} total forecasts")

    finally:
        await forecaster.close()


if __name__ == "__main__":
    asyncio.run(main())
