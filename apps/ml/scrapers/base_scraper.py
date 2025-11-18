"""
Base scraper class for poll data sources
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Optional
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class BaseScraper(ABC):
    """
    Abstract base class for poll scrapers
    All scrapers should inherit from this class
    """

    def __init__(self, source_name: str):
        self.source_name = source_name
        self.logger = logging.getLogger(f"scraper.{source_name}")

    @abstractmethod
    async def scrape_polls(self, race_id: Optional[str] = None) -> List[Dict]:
        """
        Scrape polls for a specific race or all races

        Args:
            race_id: Optional race identifier

        Returns:
            List of poll dictionaries with standardized format
        """
        pass

    @abstractmethod
    async def validate_poll(self, poll_data: Dict) -> bool:
        """
        Validate poll data before insertion

        Args:
            poll_data: Raw poll data dictionary

        Returns:
            True if valid, False otherwise
        """
        pass

    def normalize_pollster_name(self, raw_name: str) -> str:
        """
        Normalize pollster names for consistency

        Args:
            raw_name: Raw pollster name from source

        Returns:
            Normalized pollster name
        """
        # Remove common suffixes and normalize
        normalized = raw_name.strip()

        # Add more normalization rules as needed
        mappings = {
            "Rasmussen Reports": "Rasmussen",
            "Emerson College Polling": "Emerson",
            # Add more mappings
        }

        return mappings.get(normalized, normalized)

    def parse_date(self, date_str: str) -> Optional[datetime]:
        """
        Parse various date formats to datetime

        Args:
            date_str: Date string from source

        Returns:
            datetime object or None if parsing fails
        """
        # Common date formats
        formats = [
            "%Y-%m-%d",
            "%m/%d/%Y",
            "%B %d, %Y",
            "%b %d, %Y",
            "%m-%d-%Y",
        ]

        for fmt in formats:
            try:
                return datetime.strptime(date_str.strip(), fmt)
            except ValueError:
                continue

        self.logger.warning(f"Could not parse date: {date_str}")
        return None

    async def save_polls(self, polls: List[Dict]) -> int:
        """
        Save polls to database

        Args:
            polls: List of validated poll dictionaries

        Returns:
            Number of polls saved
        """
        # TODO: Implement database insertion
        # This will use the Prisma client or direct SQL
        saved_count = 0

        for poll in polls:
            if await self.validate_poll(poll):
                # Save to database
                self.logger.info(f"Saving poll: {poll.get('pollster')} - {poll.get('date')}")
                saved_count += 1
            else:
                self.logger.warning(f"Invalid poll data: {poll}")

        return saved_count

    async def run(self) -> Dict[str, int]:
        """
        Main scraper execution

        Returns:
            Statistics about the scraping run
        """
        self.logger.info(f"Starting {self.source_name} scraper")

        try:
            polls = await self.scrape_polls()
            saved_count = await self.save_polls(polls)

            self.logger.info(f"Scraper completed: {saved_count} polls saved")

            return {
                "source": self.source_name,
                "polls_found": len(polls),
                "polls_saved": saved_count,
                "success": True
            }

        except Exception as e:
            self.logger.error(f"Scraper failed: {str(e)}")
            return {
                "source": self.source_name,
                "polls_found": 0,
                "polls_saved": 0,
                "success": False,
                "error": str(e)
            }
