"""
FiveThirtyEight Scraper

Scrapes polling data from FiveThirtyEight's polling database
"""

import asyncio
import json
from typing import List, Dict, Any
from datetime import datetime
from loguru import logger

from .base import BaseScraper


class FiveThirtyEightScraper(BaseScraper):
    """Scraper for FiveThirtyEight polling data"""

    BASE_URL = "https://projects.fivethirtyeight.com"
    POLLS_API = f"{BASE_URL}/polls-page/data/president_polls.json"

    def __init__(self):
        super().__init__("FiveThirtyEight")

    async def scrape(self) -> List[Dict[str, Any]]:
        """
        Scrape polls from FiveThirtyEight

        FiveThirtyEight provides JSON data which makes scraping cleaner

        Returns:
            List of poll dictionaries
        """
        logger.info("Scraping FiveThirtyEight polls")

        try:
            # Fetch the JSON data
            html = self.fetch_page(self.POLLS_API)
            data = json.loads(html)

            polls = []

            # 538 provides structured JSON data
            for poll_entry in data:
                try:
                    poll_data = self._parse_poll_entry(poll_entry)
                    if poll_data:
                        polls.append(poll_data)
                except Exception as e:
                    logger.warning(f"Failed to parse poll entry: {e}")
                    continue

            logger.success(f"Scraped {len(polls)} polls from FiveThirtyEight")
            return polls

        except Exception as e:
            logger.error(f"FiveThirtyEight scraping failed: {e}")
            raise

    def _parse_poll_entry(self, entry: Dict) -> Dict[str, Any]:
        """
        Parse a single poll entry from 538 JSON

        Args:
            entry: Poll entry dictionary

        Returns:
            Poll dictionary or None
        """
        # FiveThirtyEight JSON structure (example - actual structure may vary)
        # The real API structure should be inspected first

        try:
            # Extract basic info
            pollster = entry.get('pollster', 'Unknown')
            poll_id = entry.get('poll_id', '')
            start_date = entry.get('start_date', '')
            end_date = entry.get('end_date', '')
            sample_size = entry.get('sample_size')
            population = entry.get('population', 'lv')  # lv, rv, a
            methodology = entry.get('methodology', 'online')

            # Get race information
            race_name = entry.get('race', entry.get('state', 'National'))
            if race_name == 'National':
                race_name = 'Presidential'

            # Extract candidate results
            results = {}

            # 538 typically has 'answers' array with candidate data
            if 'answers' in entry:
                for answer in entry['answers']:
                    candidate = answer.get('choice', '')
                    percentage = answer.get('pct', 0)
                    if candidate and percentage:
                        results[candidate] = float(percentage)

            # Fallback: look for direct candidate fields
            elif 'candidates' in entry:
                for candidate in entry['candidates']:
                    name = candidate.get('name', '')
                    pct = candidate.get('pct', 0)
                    if name and pct:
                        results[name] = float(pct)

            if not results:
                logger.debug(f"No results found for poll {poll_id}")
                return None

            poll_data = {
                'source': 'FiveThirtyEight',
                'source_poll_id': str(poll_id),
                'race_name': race_name,
                'pollster_name': pollster,
                'poll_date': end_date or start_date,  # Use end date as poll date
                'start_date': start_date,
                'end_date': end_date,
                'sample_size': sample_size,
                'results': results,
                'methodology': self._map_methodology(methodology),
                'population_type': self._map_population(population),
                'pollster_rating': entry.get('fte_grade', ''),  # 538's pollster grade
                'scraped_at': datetime.now().isoformat(),
            }

            return poll_data

        except Exception as e:
            logger.debug(f"Failed to parse poll entry: {e}")
            return None

    def _map_methodology(self, methodology: str) -> str:
        """
        Map 538 methodology to our standard format

        Args:
            methodology: 538 methodology string

        Returns:
            Standard methodology string
        """
        method_lower = methodology.lower()

        if 'phone' in method_lower or 'live' in method_lower:
            return 'PHONE'
        elif 'online' in method_lower or 'web' in method_lower:
            return 'ONLINE'
        elif 'ivr' in method_lower:
            return 'IVR'
        elif 'mixed' in method_lower:
            return 'MIXED'
        else:
            return 'OTHER'

    def _map_population(self, population: str) -> str:
        """
        Map 538 population type to our standard format

        Args:
            population: 538 population string

        Returns:
            Standard population type
        """
        pop_lower = population.lower()

        if pop_lower == 'lv' or 'likely' in pop_lower:
            return 'LV'  # Likely Voters
        elif pop_lower == 'rv' or 'registered' in pop_lower:
            return 'RV'  # Registered Voters
        elif pop_lower == 'a' or 'adult' in pop_lower:
            return 'A'   # Adults
        elif pop_lower == 'v' or 'voter' in pop_lower:
            return 'V'   # Voters
        else:
            return 'A'   # Default to adults

    async def scrape_state_polls(self, state: str) -> List[Dict[str, Any]]:
        """
        Scrape polls for a specific state

        Args:
            state: State abbreviation (e.g., 'PA', 'GA')

        Returns:
            List of poll dictionaries for that state
        """
        logger.info(f"Scraping FiveThirtyEight polls for {state}")

        # 538 may have state-specific endpoints
        state_url = f"{self.BASE_URL}/polls-page/data/{state.lower()}_polls.json"

        try:
            html = self.fetch_page(state_url)
            data = json.loads(html)

            polls = []
            for entry in data:
                poll_data = self._parse_poll_entry(entry)
                if poll_data:
                    polls.append(poll_data)

            logger.success(f"Scraped {len(polls)} polls for {state}")
            return polls

        except Exception as e:
            logger.warning(f"Failed to scrape {state} polls: {e}")
            return []


async def main():
    """Run 538 scraper standalone"""
    logger.info("Starting FiveThirtyEight scraper")

    scraper = FiveThirtyEightScraper()
    try:
        result = await scraper.run()
        logger.info(f"Scraper result: {result}")
    finally:
        scraper.close()


if __name__ == "__main__":
    asyncio.run(main())
