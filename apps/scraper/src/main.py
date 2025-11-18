"""
Main Scraper Runner

Runs all scrapers and aggregates results
"""

import asyncio
from loguru import logger
from scrapers.rcp import RCPScraper
from scrapers.fivethirtyeight import FiveThirtyEightScraper
from database import DatabaseManager


async def run_all_scrapers():
    """Run all scrapers in sequence and save to database"""
    logger.info("Starting all scrapers")

    # Initialize database
    db = DatabaseManager()
    await db.connect()

    scrapers = [
        RCPScraper(),
        FiveThirtyEightScraper(),
    ]

    results = []
    all_polls = []

    for scraper in scrapers:
        try:
            result = await scraper.run()
            results.append(result)

            # Collect polls for database saving
            if result.get('success') and result.get('polls'):
                all_polls.extend(result.get('polls', []))

        except Exception as e:
            logger.error(f"Scraper {scraper.source_name} failed: {e}")
            results.append({
                'source': scraper.source_name,
                'success': False,
                'error': str(e)
            })
        finally:
            scraper.close()

    # Save all polls to database
    if all_polls:
        logger.info(f"Saving {len(all_polls)} polls to database")
        db_result = await db.save_polls_batch(all_polls)
        logger.info(f"Database save results: {db_result}")
    else:
        logger.warning("No polls to save to database")

    # Disconnect from database
    await db.disconnect()

    # Summary
    successful = sum(1 for r in results if r.get('success'))
    failed = len(results) - successful
    total_polls = sum(r.get('polls_scraped', 0) for r in results)

    logger.info(f"Scraping complete: {successful} successful, {failed} failed")
    logger.info(f"Total polls scraped: {total_polls}")

    return results


if __name__ == "__main__":
    # Set up logging
    logger.add(
        "logs/scraper.log",
        rotation="1 day",
        retention="7 days",
        level="INFO"
    )

    asyncio.run(run_all_scrapers())
