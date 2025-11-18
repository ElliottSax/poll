"""
FiveThirtyEight data importer
"""

from typing import List, Dict, Optional
import httpx
from datetime import datetime
from .base_scraper import BaseScraper


class FiveThirtyEightScraper(BaseScraper):
    """
    Scraper for FiveThirtyEight polling data

    FiveThirtyEight provides CSV files with polling data
    This scraper downloads and parses those files
    """

    def __init__(self):
        super().__init__("FiveThirtyEight")
        self.base_url = "https://projects.fivethirtyeight.com/polls/data"
        self.csv_urls = {
            "president": f"{self.base_url}/president_polls.csv",
            "senate": f"{self.base_url}/senate_polls.csv",
            "house": f"{self.base_url}/house_polls.csv",
            "governor": f"{self.base_url}/governor_polls.csv",
        }

    async def scrape_polls(self, race_id: Optional[str] = None) -> List[Dict]:
        """
        Download and parse FiveThirtyEight CSV data

        Args:
            race_id: Optional race identifier (e.g., "2024-president")

        Returns:
            List of standardized poll dictionaries
        """
        self.logger.info(f"Downloading FiveThirtyEight data for: {race_id or 'all races'}")

        polls = []

        # Determine which CSV files to download
        if race_id:
            # Parse race_id to determine race type
            # Format: "2024-president" or "2024-senate-AZ"
            parts = race_id.split('-')
            race_type = parts[1] if len(parts) > 1 else 'president'
            csv_url = self.csv_urls.get(race_type)

            if csv_url:
                race_polls = await self._download_and_parse_csv(csv_url, race_id)
                polls.extend(race_polls)
        else:
            # Download all CSV files
            for race_type, csv_url in self.csv_urls.items():
                self.logger.info(f"Downloading {race_type} polls...")
                race_polls = await self._download_and_parse_csv(csv_url)
                polls.extend(race_polls)

        self.logger.info(f"Found {len(polls)} polls from FiveThirtyEight")
        return polls

    async def _download_and_parse_csv(
        self,
        csv_url: str,
        filter_race_id: Optional[str] = None
    ) -> List[Dict]:
        """
        Download and parse a CSV file from FiveThirtyEight

        Args:
            csv_url: URL to CSV file
            filter_race_id: Optional race ID to filter results

        Returns:
            List of poll dictionaries
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(csv_url, timeout=30.0)
                response.raise_for_status()

            # TODO: Parse CSV data
            # Use pandas or csv module to parse the CSV
            # Transform to our standardized format

            # Placeholder implementation
            self.logger.info(f"Downloaded CSV from {csv_url}")

            # Example of what the transformation should look like:
            polls = []

            # csv_data = pd.read_csv(StringIO(response.text))
            # for _, row in csv_data.iterrows():
            #     poll = {
            #         "pollster": row['pollster'],
            #         "date": self.parse_date(row['end_date']),
            #         "sample_size": row['sample_size'],
            #         "population": row['population'],  # LV, RV, A
            #         "methodology": self._map_methodology(row['methodology']),
            #         "race_id": self._extract_race_id(row),
            #         "results": self._extract_results(row),
            #         "url": row.get('url', ''),
            #         "partisan": self._detect_partisan(row['pollster'])
            #     }
            #     polls.append(poll)

            return polls

        except httpx.HTTPError as e:
            self.logger.error(f"HTTP error downloading CSV: {e}")
            return []
        except Exception as e:
            self.logger.error(f"Error parsing CSV: {e}")
            return []

    def _map_methodology(self, raw_method: str) -> str:
        """Map FiveThirtyEight methodology to our standard"""
        mapping = {
            "Live Phone": "phone",
            "Online": "online",
            "IVR": "ivr",
            "Live Phone/Online": "mixed",
        }
        return mapping.get(raw_method, "online")

    def _extract_race_id(self, row: Dict) -> str:
        """Extract race ID from CSV row"""
        # TODO: Implement based on CSV structure
        # Should return something like "2024-president" or "2024-senate-AZ"
        return "2024-president"

    def _extract_results(self, row: Dict) -> List[Dict]:
        """Extract candidate results from CSV row"""
        # TODO: Implement based on CSV structure
        # FiveThirtyEight has columns like "answer", "pct", etc.
        return []

    def _detect_partisan(self, pollster: str) -> Optional[str]:
        """Detect if pollster has partisan lean"""
        # Known partisan pollsters
        democratic_pollsters = ["PPP", "Anzalone", "Garin-Hart-Yang"]
        republican_pollsters = ["Rasmussen", "Trafalgar", "InsiderAdvantage"]

        if any(p in pollster for p in democratic_pollsters):
            return "D"
        elif any(p in pollster for p in republican_pollsters):
            return "R"
        return None

    async def validate_poll(self, poll_data: Dict) -> bool:
        """
        Validate FiveThirtyEight poll data

        Args:
            poll_data: Poll dictionary to validate

        Returns:
            True if valid, False otherwise
        """
        required_fields = ["pollster", "date", "race_id", "results"]

        # Check required fields
        for field in required_fields:
            if field not in poll_data or poll_data[field] is None:
                self.logger.warning(f"Missing required field: {field}")
                return False

        # Validate date
        if not isinstance(poll_data["date"], datetime):
            self.logger.warning("Invalid date format")
            return False

        # Validate results
        if not isinstance(poll_data["results"], list) or len(poll_data["results"]) == 0:
            self.logger.warning("Invalid or empty results")
            return False

        # Validate percentages sum to reasonable total (80-105%)
        total_pct = sum(r.get("percentage", 0) for r in poll_data["results"])
        if not (80 <= total_pct <= 105):
            self.logger.warning(f"Percentages sum to {total_pct}%, expected 80-105%")
            return False

        return True


# Example usage
if __name__ == "__main__":
    import asyncio

    async def test_scraper():
        scraper = FiveThirtyEightScraper()
        result = await scraper.run()
        print(f"Scraper result: {result}")

    asyncio.run(test_scraper())
