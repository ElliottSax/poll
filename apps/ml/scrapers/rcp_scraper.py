"""
RealClearPolitics scraper implementation
"""

from typing import List, Dict, Optional
from .base_scraper import BaseScraper


class RCPScraper(BaseScraper):
    """
    Scraper for RealClearPolitics polling data

    TODO for Instance 3 (Data/ML workstream):
    1. Implement scrape_polls method to fetch RCP data
    2. Parse HTML/API responses
    3. Extract poll metadata (pollster, date, sample size, etc.)
    4. Extract poll results (candidate percentages)
    5. Implement validate_poll for RCP-specific validation
    6. Add error handling and retry logic
    7. Add rate limiting to respect RCP's servers
    """

    def __init__(self):
        super().__init__("RealClearPolitics")
        self.base_url = "https://www.realclearpolls.com"

    async def scrape_polls(self, race_id: Optional[str] = None) -> List[Dict]:
        """
        Scrape polls from RealClearPolitics with BeautifulSoup

        Args:
            race_id: Optional race identifier

        Returns:
            List of standardized poll dictionaries
        """
        self.logger.info(f"Scraping RCP for race: {race_id or 'all'}")

        try:
            import httpx
            from bs4 import BeautifulSoup
        except ImportError:
            self.logger.error("Required packages not installed: httpx, beautifulsoup4, lxml")
            return []

        polls = []

        # RCP URL for 2024 presidential race
        url = "https://www.realclearpolls.com/polls/president/general/2024/trump-vs-harris"

        try:
            async with httpx.AsyncClient() as client:
                self.logger.info(f"Fetching {url}")
                response = await client.get(url, timeout=30.0, follow_redirects=True)
                response.raise_for_status()

            soup = BeautifulSoup(response.text, 'lxml')

            # Find the polls table (RCP uses class="data")
            table = soup.find('table', {'class': 'data'})

            if not table:
                self.logger.warning("No polls table found on page")
                return polls

            # Parse table rows (skip header)
            rows = table.find_all('tr')[1:]

            for row in rows:
                cells = row.find_all('td')
                if len(cells) < 5:
                    continue

                try:
                    # Extract data from cells
                    pollster = cells[0].get_text(strip=True)
                    date_str = cells[1].get_text(strip=True)
                    sample_str = cells[2].get_text(strip=True)

                    # Parse sample size and population
                    sample_size = None
                    population = "LV"
                    if sample_str and sample_str != '--':
                        parts = sample_str.split()
                        if parts and parts[0].isdigit():
                            sample_size = int(parts[0])
                        if len(parts) > 1:
                            population = parts[1]

                    # Extract candidate results (typically in cells 3 and 4)
                    results = []
                    candidates = ['Trump', 'Harris']

                    for i, candidate in enumerate(candidates):
                        if len(cells) > (3 + i):
                            pct_text = cells[3 + i].get_text(strip=True)
                            if pct_text and pct_text != '--':
                                percentage = float(pct_text.replace('%', ''))
                                results.append({
                                    "candidate": candidate,
                                    "percentage": percentage
                                })

                    # Parse date
                    poll_date = self.parse_date(date_str)
                    if not poll_date or not results:
                        continue

                    poll = {
                        "pollster": self.normalize_pollster_name(pollster),
                        "date": poll_date.isoformat(),
                        "sample_size": sample_size,
                        "population": population,
                        "methodology": "mixed",
                        "race_id": race_id or "2024-president",
                        "results": results,
                        "url": url,
                        "source": "RealClearPolitics"
                    }

                    polls.append(poll)

                except (ValueError, IndexError, AttributeError) as e:
                    self.logger.warning(f"Error parsing row: {e}")
                    continue

            self.logger.info(f"Successfully scraped {len(polls)} polls from RCP")

        except Exception as e:
            self.logger.error(f"Error scraping RCP: {e}")

        return polls

    async def validate_poll(self, poll_data: Dict) -> bool:
        """
        Validate RCP poll data

        Args:
            poll_data: Poll dictionary to validate

        Returns:
            True if valid, False otherwise
        """
        # Check required fields
        required_fields = ["pollster", "date", "race_id", "results"]

        for field in required_fields:
            if field not in poll_data:
                self.logger.warning(f"Missing required field: {field}")
                return False

        # Validate results structure
        if not isinstance(poll_data["results"], list) or len(poll_data["results"]) == 0:
            self.logger.warning("Invalid or empty results")
            return False

        # Validate percentages sum to reasonable total (80-105%)
        total_pct = sum(r.get("percentage", 0) for r in poll_data["results"])
        if not (80 <= total_pct <= 105):
            self.logger.warning(f"Percentages sum to {total_pct}%, expected 80-105%")
            return False

        # Validate sample size if present
        if poll_data.get("sample_size") and poll_data["sample_size"] < 100:
            self.logger.warning(f"Sample size too small: {poll_data['sample_size']}")
            return False

        return True


# Example usage (for testing)
if __name__ == "__main__":
    import asyncio

    async def test_scraper():
        scraper = RCPScraper()
        result = await scraper.run()
        print(result)

    asyncio.run(test_scraper())
