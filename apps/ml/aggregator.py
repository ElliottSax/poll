"""
Poll Aggregation Service
Computes aggregated polling averages with sophisticated weighting
"""

import logging
import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
import httpx
import math

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PollAggregator:
    """
    Aggregates polls using weighted averaging with multiple factors:
    - Recency (exponential decay)
    - Sample size (square root weighting)
    - Pollster quality (grade-based weighting)
    """

    def __init__(self, api_base_url: str = "http://localhost:3001"):
        self.api_base_url = api_base_url
        self.client = httpx.AsyncClient(timeout=30.0)

    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()

    def calculate_recency_weight(self, poll_date: datetime, half_life_days: int = 30) -> float:
        """
        Calculate exponential decay weight based on poll age

        Args:
            poll_date: Date when poll was conducted
            half_life_days: Days for weight to decay to 50%

        Returns:
            Weight between 0 and 1
        """
        days_old = (datetime.now() - poll_date).days
        decay_constant = math.log(2) / half_life_days
        return math.exp(-decay_constant * days_old)

    def calculate_sample_weight(self, sample_size: int, base_size: int = 1000) -> float:
        """
        Calculate weight based on sample size using square root

        Args:
            sample_size: Number of respondents
            base_size: Reference sample size

        Returns:
            Relative weight (1.0 = base_size)
        """
        return math.sqrt(sample_size / base_size)

    def calculate_pollster_weight(self, grade: Optional[str]) -> float:
        """
        Calculate weight based on pollster grade

        Args:
            grade: FiveThirtyEight-style grade (A+, A, B+, etc.)

        Returns:
            Weight multiplier
        """
        grade_weights = {
            'A+': 1.0,
            'A': 0.95,
            'A-': 0.90,
            'A/B': 0.85,
            'B+': 0.80,
            'B': 0.75,
            'B-': 0.70,
            'B/C': 0.65,
            'C+': 0.60,
            'C': 0.55,
            'C-': 0.50,
            'C/D': 0.45,
            'D+': 0.40,
            'D': 0.35,
            'D-': 0.30,
        }
        return grade_weights.get(grade or '', 0.70)  # Default to 0.70 if no grade

    async def fetch_race_polls(self, race_slug: str) -> List[Dict[str, Any]]:
        """
        Fetch all polls for a specific race

        Args:
            race_slug: Race identifier

        Returns:
            List of poll data dictionaries
        """
        try:
            response = await self.client.get(
                f"{self.api_base_url}/api/races/{race_slug}/polls"
            )
            response.raise_for_status()
            data = response.json()
            return data.get('polls', [])
        except Exception as e:
            logger.error(f"Failed to fetch polls for race {race_slug}: {e}")
            return []

    async def aggregate_race_polls(
        self,
        race_slug: str,
        lookback_days: int = 60
    ) -> Dict[str, Any]:
        """
        Aggregate all polls for a race into weighted averages

        Args:
            race_slug: Race identifier
            lookback_days: Only include polls from last N days

        Returns:
            Aggregated results with candidate averages
        """
        logger.info(f"Aggregating polls for race: {race_slug}")

        polls = await self.fetch_race_polls(race_slug)

        if not polls:
            logger.warning(f"No polls found for race: {race_slug}")
            return {
                'race_slug': race_slug,
                'aggregated_results': [],
                'total_polls': 0,
                'error': 'No polls available'
            }

        # Filter polls by date
        cutoff_date = datetime.now() - timedelta(days=lookback_days)
        recent_polls = [
            p for p in polls
            if datetime.fromisoformat(p['endDate'].replace('Z', '+00:00')) > cutoff_date
        ]

        if not recent_polls:
            logger.warning(f"No recent polls found for race: {race_slug}")
            return {
                'race_slug': race_slug,
                'aggregated_results': [],
                'total_polls': 0,
                'error': f'No polls in last {lookback_days} days'
            }

        logger.info(f"Aggregating {len(recent_polls)} recent polls")

        # Collect all candidate results with weights
        candidate_data: Dict[str, List[tuple[float, float]]] = {}  # candidate_id -> [(value, weight)]

        for poll in recent_polls:
            poll_date = datetime.fromisoformat(poll['endDate'].replace('Z', '+00:00'))

            # Calculate weights
            recency_weight = self.calculate_recency_weight(poll_date)
            sample_weight = self.calculate_sample_weight(poll['sampleSize'])
            pollster_grade = poll.get('pollster', {}).get('grade')
            pollster_weight = self.calculate_pollster_weight(pollster_grade)

            # Combined weight
            total_weight = recency_weight * sample_weight * pollster_weight

            # Extract candidate results
            results = poll.get('results', [])
            for result in results:
                candidate_id = result.get('candidateId')
                value = result.get('value', 0)

                if candidate_id not in candidate_data:
                    candidate_data[candidate_id] = []

                candidate_data[candidate_id].append((value, total_weight))

        # Calculate weighted averages
        aggregated_results = []
        for candidate_id, values_weights in candidate_data.items():
            weighted_sum = sum(v * w for v, w in values_weights)
            weight_sum = sum(w for _, w in values_weights)

            if weight_sum > 0:
                weighted_average = weighted_sum / weight_sum
                aggregated_results.append({
                    'candidate_id': candidate_id,
                    'weighted_average': round(weighted_average, 2),
                    'poll_count': len(values_weights),
                    'total_weight': round(weight_sum, 2)
                })

        # Sort by average (descending)
        aggregated_results.sort(key=lambda x: x['weighted_average'], reverse=True)

        logger.info(f"Aggregation complete for {race_slug}: {len(aggregated_results)} candidates")

        return {
            'race_slug': race_slug,
            'aggregated_results': aggregated_results,
            'total_polls': len(recent_polls),
            'lookback_days': lookback_days,
            'computed_at': datetime.now().isoformat()
        }

    async def aggregate_all_races(self) -> List[Dict[str, Any]]:
        """
        Aggregate polls for all active races

        Returns:
            List of aggregation results
        """
        logger.info("Starting aggregation for all races")

        try:
            # Fetch all races
            response = await self.client.get(f"{self.api_base_url}/api/races")
            response.raise_for_status()
            data = response.json()
            races = data.get('races', [])

            logger.info(f"Found {len(races)} races to aggregate")

            # Aggregate each race
            results = []
            for race in races:
                race_slug = race.get('slug')
                if race_slug:
                    result = await self.aggregate_race_polls(race_slug)
                    results.append(result)
                    await asyncio.sleep(0.5)  # Brief delay to avoid overwhelming API

            logger.info(f"Completed aggregation for {len(results)} races")
            return results

        except Exception as e:
            logger.error(f"Failed to aggregate all races: {e}")
            return []


# For testing standalone
async def main():
    aggregator = PollAggregator()

    try:
        # Test with a specific race
        result = await aggregator.aggregate_race_polls("2024-presidential")
        logger.info(f"Aggregation result: {result}")

        # Or aggregate all races
        # results = await aggregator.aggregate_all_races()
        # logger.info(f"Aggregated {len(results)} races")

    finally:
        await aggregator.close()


if __name__ == "__main__":
    asyncio.run(main())
