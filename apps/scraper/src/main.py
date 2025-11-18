"""
Main Scraper Runner

Runs all scrapers and aggregates results
"""

import asyncio
from loguru import logger
from scrapers.rcp import RCPScraper
# from scrapers.fivethirtyeight import FiveThirtyEightScraper


async def run_all_scrapers():
    """Run all scrapers in sequence"""
    logger.info("Starting all scrapers")

    scrapers = [
        RCPScraper(),
        # FiveThirtyEightScraper(),  # Add when implemented
    ]

    results = []

    for scraper in scrapers:
        try:
            result = await scraper.run()
            results.append(result)
        except Exception as e:
            logger.error(f"Scraper {scraper.source_name} failed: {e}")
            results.append({
                'source': scraper.source_name,
                'success': False,
                'error': str(e)
            })
        finally:
            scraper.close()

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
