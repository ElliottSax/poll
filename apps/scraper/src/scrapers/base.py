"""
Base Scraper Class

All scrapers inherit from this base class
"""

import asyncio
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime
import requests
from bs4 import BeautifulSoup
from loguru import logger
from tenacity import retry, stop_after_attempt, wait_exponential
import os


class BaseScraper(ABC):
    """Base class for all poll scrapers"""

    def __init__(self, source_name: str):
        self.source_name = source_name
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': os.getenv(
                'USER_AGENT',
                'PollingDashboard Bot/1.0 (+https://pollingdashboard.com/bot)'
            )
        })

        logger.info(f"Initialized {source_name} scraper")

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=4, max=10),
        reraise=True
    )
    def fetch_page(self, url: str) -> str:
        """
        Fetch a web page with retry logic

        Args:
            url: URL to fetch

        Returns:
            HTML content as string

        Raises:
            requests.RequestException: If request fails after retries
        """
        logger.debug(f"Fetching: {url}")

        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            logger.debug(f"Successfully fetched: {url}")
            return response.text

        except requests.RequestException as e:
            logger.error(f"Failed to fetch {url}: {e}")
            raise

    def parse_html(self, html: str) -> BeautifulSoup:
        """
        Parse HTML content with BeautifulSoup

        Args:
            html: HTML content string

        Returns:
            BeautifulSoup object
        """
        return BeautifulSoup(html, 'lxml')

    @abstractmethod
    async def scrape(self) -> List[Dict[str, Any]]:
        """
        Main scraping method - must be implemented by subclasses

        Returns:
            List of poll dictionaries
        """
        raise NotImplementedError("Subclasses must implement scrape()")

    async def save_to_database(self, polls: List[Dict[str, Any]]) -> int:
        """
        Save scraped polls to database

        Args:
            polls: List of poll dictionaries

        Returns:
            Number of polls saved
        """
        # TODO: Implement database saving with Prisma
        # For now, just log
        logger.info(f"Would save {len(polls)} polls to database")
        return len(polls)

    async def run(self) -> Dict[str, Any]:
        """
        Run the complete scraping pipeline

        Returns:
            Summary dict with results
        """
        start_time = datetime.now()
        logger.info(f"Starting {self.source_name} scraper")

        try:
            # Scrape data
            polls = await self.scrape()
            logger.success(f"Scraped {len(polls)} polls from {self.source_name}")

            # Save to database
            saved_count = await self.save_to_database(polls)
            logger.success(f"Saved {saved_count} polls to database")

            duration = (datetime.now() - start_time).total_seconds()

            return {
                'source': self.source_name,
                'success': True,
                'polls_scraped': len(polls),
                'polls_saved': saved_count,
                'duration_seconds': duration,
                'timestamp': datetime.now().isoformat(),
            }

        except Exception as e:
            duration = (datetime.now() - start_time).total_seconds()
            logger.error(f"Scraper failed: {e}")

            return {
                'source': self.source_name,
                'success': False,
                'error': str(e),
                'duration_seconds': duration,
                'timestamp': datetime.now().isoformat(),
            }

    def close(self):
        """Clean up resources"""
        self.session.close()
        logger.info(f"Closed {self.source_name} scraper")
