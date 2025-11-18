"""
RealClearPolitics Scraper

Scrapes polling data from RealClearPolitics
"""

import asyncio
import re
from typing import List, Dict, Any
from datetime import datetime
from loguru import logger

from .base import BaseScraper


class RCPScraper(BaseScraper):
    """Scraper for RealClearPolitics polling data"""

    BASE_URL = "https://www.realclearpolitics.com"
    POLLS_URL = f"{BASE_URL}/epolls/latest_polls/"

    def __init__(self):
        super().__init__("RealClearPolitics")

    async def scrape(self) -> List[Dict[str, Any]]:
        """
        Scrape polls from RCP

        Returns:
            List of poll dictionaries
        """
        logger.info("Scraping RealClearPolitics latest polls")

        try:
            # Fetch the latest polls page
            html = self.fetch_page(self.POLLS_URL)
            soup = self.parse_html(html)

            polls = []

            # Find all poll tables (RCP uses specific structure)
            # NOTE: This is a simplified example - actual RCP scraping requires
            # more sophisticated parsing based on their current HTML structure

            poll_tables = soup.find_all('table', class_='data large')

            for table in poll_tables:
                rows = table.find_all('tr')[1:]  # Skip header row

                for row in rows:
                    try:
                        poll_data = self._parse_poll_row(row)
                        if poll_data:
                            polls.append(poll_data)
                    except Exception as e:
                        logger.warning(f"Failed to parse poll row: {e}")
                        continue

            logger.success(f"Scraped {len(polls)} polls from RCP")
            return polls

        except Exception as e:
            logger.error(f"RCP scraping failed: {e}")
            raise

    def _parse_poll_row(self, row) -> Dict[str, Any]:
        """
        Parse a single poll row from RCP table

        Args:
            row: BeautifulSoup row element

        Returns:
            Poll dictionary or None
        """
        # This is a simplified example
        # Actual implementation depends on RCP's current HTML structure

        cells = row.find_all('td')
        if len(cells) < 5:
            return None

        # Extract data from cells
        # Example structure (may vary):
        # [Race, Poll, Date, Sample, Results]

        try:
            poll_data = {
                'source': 'RealClearPolitics',
                'race_name': cells[0].get_text(strip=True),
                'pollster_name': cells[1].get_text(strip=True),
                'poll_date': self._parse_date(cells[2].get_text(strip=True)),
                'sample_size': self._parse_sample_size(cells[3].get_text(strip=True)),
                'results': self._parse_results(cells[4].get_text(strip=True)),
                'methodology': 'PHONE',  # Default, may be extracted from poll details
                'population_type': 'LV',  # Default
                'scraped_at': datetime.now().isoformat(),
            }

            return poll_data

        except Exception as e:
            logger.debug(f"Failed to parse poll row: {e}")
            return None

    def _parse_date(self, date_str: str) -> str:
        """
        Parse date string from RCP format

        Args:
            date_str: Date string (e.g., "12/15 - 12/18")

        Returns:
            ISO format date string
        """
        # RCP often uses date ranges, take the end date
        # Example: "12/15 - 12/18" -> "12/18"

        if ' - ' in date_str:
            date_str = date_str.split(' - ')[1]

        try:
            # Add current year if not present
            if '/' in date_str:
                parts = date_str.split('/')
                if len(parts) == 2:
                    month, day = parts
                    year = datetime.now().year
                    date_obj = datetime(year, int(month), int(day))
                    return date_obj.date().isoformat()

            return datetime.now().date().isoformat()

        except:
            return datetime.now().date().isoformat()

    def _parse_sample_size(self, sample_str: str) -> int:
        """
        Parse sample size from string

        Args:
            sample_str: Sample size string (e.g., "1200 LV", "800 RV")

        Returns:
            Sample size as integer
        """
        # Extract numbers from string
        numbers = re.findall(r'\d+', sample_str)
        if numbers:
            return int(numbers[0])
        return None

    def _parse_results(self, results_str: str) -> Dict[str, float]:
        """
        Parse poll results from string

        Args:
            results_str: Results string (e.g., "Biden 48, Trump 46")

        Returns:
            Dict of candidate -> percentage
        """
        results = {}

        # Simple parsing - actual implementation may be more complex
        # Example: "Biden 48, Trump 46, Kennedy 3"

        pairs = results_str.split(',')
        for pair in pairs:
            parts = pair.strip().rsplit(' ', 1)
            if len(parts) == 2:
                candidate, percentage = parts
                try:
                    results[candidate.strip()] = float(percentage)
                except ValueError:
                    continue

        return results


async def main():
    """Run RCP scraper standalone"""
    logger.info("Starting RCP scraper")

    scraper = RCPScraper()
    try:
        result = await scraper.run()
        logger.info(f"Scraper result: {result}")
    finally:
        scraper.close()


if __name__ == "__main__":
    asyncio.run(main())
