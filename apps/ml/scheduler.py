"""
Scraper Scheduler
Automates poll scraping on a regular schedule
"""

import asyncio
import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime

from scrapers import RCPScraper, FiveThirtyEightScraper
from aggregator import PollAggregator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ScraperScheduler:
    """
    Manages automated scraping and aggregation schedule
    """

    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.rcp_scraper = RCPScraper()
        self.fte_scraper = FiveThirtyEightScraper()
        self.aggregator = PollAggregator()

    async def run_rcp_scraper(self):
        """Run RCP scraper"""
        logger.info("=== Starting RCP scraper ===")
        try:
            result = await self.rcp_scraper.run()
            logger.info(f"RCP scraper completed: {result}")
        except Exception as e:
            logger.error(f"RCP scraper failed: {e}")

    async def run_fte_scraper(self):
        """Run FiveThirtyEight scraper"""
        logger.info("=== Starting FiveThirtyEight scraper ===")
        try:
            result = await self.fte_scraper.run()
            logger.info(f"FTE scraper completed: {result}")
        except Exception as e:
            logger.error(f"FTE scraper failed: {e}")

    async def run_all_scrapers(self):
        """Run all scrapers sequentially"""
        logger.info("=== Running all scrapers ===")
        await self.run_rcp_scraper()
        await asyncio.sleep(5)  # Brief delay between scrapers
        await self.run_fte_scraper()
        logger.info("=== All scrapers completed ===")

    async def run_aggregation(self):
        """Run poll aggregation for all races"""
        logger.info("=== Starting poll aggregation ===")
        try:
            results = await self.aggregator.aggregate_all_races()
            logger.info(f"Aggregation completed: {len(results)} races processed")
        except Exception as e:
            logger.error(f"Aggregation failed: {e}")

    async def run_scrape_and_aggregate(self):
        """Run all scrapers followed by aggregation"""
        logger.info("=== Running scrape + aggregate pipeline ===")
        await self.run_all_scrapers()
        await asyncio.sleep(10)  # Wait for data to settle
        await self.run_aggregation()
        logger.info("=== Pipeline completed ===")

    def start(self):
        """
        Start the scheduler with defined jobs
        """
        logger.info("Starting scraper scheduler...")

        # Schedule RCP scraper - every 6 hours
        self.scheduler.add_job(
            self.run_rcp_scraper,
            trigger=IntervalTrigger(hours=6),
            id='rcp_scraper',
            name='RCP Scraper (every 6 hours)',
            replace_existing=True
        )

        # Schedule FiveThirtyEight scraper - daily at 3 AM
        self.scheduler.add_job(
            self.run_fte_scraper,
            trigger=CronTrigger(hour=3, minute=0),
            id='fte_scraper',
            name='FiveThirtyEight Scraper (daily 3 AM)',
            replace_existing=True
        )

        # Schedule full scrape - daily at midnight
        self.scheduler.add_job(
            self.run_all_scrapers,
            trigger=CronTrigger(hour=0, minute=0),
            id='all_scrapers',
            name='All Scrapers (daily midnight)',
            replace_existing=True
        )

        # Schedule aggregation - every 2 hours
        self.scheduler.add_job(
            self.run_aggregation,
            trigger=IntervalTrigger(hours=2),
            id='aggregation',
            name='Poll Aggregation (every 2 hours)',
            replace_existing=True
        )

        # Schedule full pipeline - daily at 4 AM (after 3 AM scrape)
        self.scheduler.add_job(
            self.run_scrape_and_aggregate,
            trigger=CronTrigger(hour=4, minute=0),
            id='scrape_aggregate_pipeline',
            name='Scrape + Aggregate Pipeline (daily 4 AM)',
            replace_existing=True
        )

        # Start the scheduler
        self.scheduler.start()
        logger.info("Scheduler started successfully")
        logger.info("Scheduled jobs:")
        for job in self.scheduler.get_jobs():
            logger.info(f"  - {job.name} (ID: {job.id})")

    def stop(self):
        """Stop the scheduler"""
        logger.info("Stopping scheduler...")
        self.scheduler.shutdown()
        logger.info("Scheduler stopped")


# For running standalone
if __name__ == "__main__":
    scheduler = ScraperScheduler()

    try:
        scheduler.start()
        logger.info("Scheduler is running. Press Ctrl+C to exit.")

        # Keep the script running
        asyncio.get_event_loop().run_forever()

    except (KeyboardInterrupt, SystemExit):
        logger.info("Shutting down...")
        scheduler.stop()
