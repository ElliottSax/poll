"""
Database Module

Handles saving scraped polls to PostgreSQL database
"""

from typing import Dict, Any, Optional, List
from datetime import datetime
from prisma import Prisma
from loguru import logger
import os


class DatabaseManager:
    """Manages database operations for scraped polls"""

    def __init__(self):
        self.db = Prisma()
        self.pollster_cache: Dict[str, str] = {}  # name -> id
        self.race_cache: Dict[str, str] = {}  # slug -> id

    async def connect(self):
        """Connect to database"""
        try:
            await self.db.connect()
            logger.info("Connected to database")
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")
            raise

    async def disconnect(self):
        """Disconnect from database"""
        try:
            await self.db.disconnect()
            logger.info("Disconnected from database")
        except Exception as e:
            logger.error(f"Failed to disconnect from database: {e}")

    async def get_or_create_pollster(
        self,
        name: str,
        organization: Optional[str] = None,
        website: Optional[str] = None,
        methodology_grade: str = 'C',
    ) -> str:
        """Get existing pollster or create new one"""

        # Check cache first
        if name in self.pollster_cache:
            return self.pollster_cache[name]

        # Generate slug from name
        slug = name.lower().replace(' ', '-').replace('/', '-')

        # Try to find existing pollster
        pollster = await self.db.pollster.find_unique(
            where={'slug': slug}
        )

        if pollster:
            self.pollster_cache[name] = pollster.id
            return pollster.id

        # Create new pollster
        try:
            pollster = await self.db.pollster.create(
                data={
                    'name': name,
                    'slug': slug,
                    'organization': organization,
                    'website': website,
                    'methodologyGrade': methodology_grade,
                    'pollCount': 0,
                }
            )
            logger.info(f"Created new pollster: {name}")
            self.pollster_cache[name] = pollster.id
            return pollster.id
        except Exception as e:
            logger.error(f"Failed to create pollster {name}: {e}")
            raise

    async def get_or_create_race(
        self,
        race_name: str,
        race_type: str = 'PRESIDENT',
        state: Optional[str] = None,
        election_date: Optional[datetime] = None,
    ) -> str:
        """Get existing race or create new one"""

        # Generate slug from race name
        slug = race_name.lower().replace(' ', '-').replace('/', '-')

        # Check cache first
        if slug in self.race_cache:
            return self.race_cache[slug]

        # Try to find existing race
        race = await self.db.race.find_unique(
            where={'slug': slug}
        )

        if race:
            self.race_cache[slug] = race.id
            return race.id

        # Create new race
        try:
            # Default election date if not provided
            if not election_date:
                election_date = datetime(2024, 11, 5)

            race = await self.db.race.create(
                data={
                    'raceType': race_type,
                    'raceName': race_name,
                    'slug': slug,
                    'state': state,
                    'electionDate': election_date,
                    'status': 'ACTIVE',
                    'candidates': {},
                }
            )
            logger.info(f"Created new race: {race_name}")
            self.race_cache[slug] = race.id
            return race.id
        except Exception as e:
            logger.error(f"Failed to create race {race_name}: {e}")
            raise

    async def save_poll(self, poll_data: Dict[str, Any]) -> Optional[str]:
        """Save a poll to the database"""

        try:
            # Get or create pollster
            pollster_id = await self.get_or_create_pollster(
                name=poll_data.get('pollster', 'Unknown'),
                organization=poll_data.get('organization'),
                methodology_grade=poll_data.get('pollster_grade', 'C'),
            )

            # Get or create race
            race_id = await self.get_or_create_race(
                race_name=poll_data.get('race', 'Unknown Race'),
                race_type=poll_data.get('race_type', 'PRESIDENT'),
                state=poll_data.get('state'),
                election_date=poll_data.get('election_date'),
            )

            # Check if poll already exists (by unique combination)
            poll_date = poll_data.get('poll_date')
            if isinstance(poll_date, str):
                poll_date = datetime.fromisoformat(poll_date)

            existing_poll = await self.db.poll.find_first(
                where={
                    'raceId': race_id,
                    'pollsterId': pollster_id,
                    'pollDate': poll_date,
                    'sampleSize': poll_data.get('sample_size'),
                }
            )

            if existing_poll:
                logger.debug(f"Poll already exists, skipping")
                return existing_poll.id

            # Create poll
            poll = await self.db.poll.create(
                data={
                    'raceId': race_id,
                    'pollsterId': pollster_id,
                    'pollDate': poll_date,
                    'sampleSize': poll_data.get('sample_size'),
                    'methodology': poll_data.get('methodology', 'UNKNOWN'),
                    'populationType': poll_data.get('population_type', 'LIKELY_VOTERS'),
                    'results': poll_data.get('results', {}),
                    'marginOfError': poll_data.get('margin_of_error'),
                    'sponsorName': poll_data.get('sponsor'),
                }
            )

            logger.info(f"Saved poll {poll.id} for race {poll_data.get('race')}")
            return poll.id

        except Exception as e:
            logger.error(f"Failed to save poll: {e}")
            logger.error(f"Poll data: {poll_data}")
            return None

    async def save_polls_batch(self, polls: List[Dict[str, Any]]) -> Dict[str, int]:
        """Save multiple polls to database"""

        saved = 0
        skipped = 0
        failed = 0

        for poll_data in polls:
            try:
                poll_id = await self.save_poll(poll_data)
                if poll_id:
                    saved += 1
                else:
                    skipped += 1
            except Exception as e:
                logger.error(f"Failed to save poll: {e}")
                failed += 1

        return {
            'saved': saved,
            'skipped': skipped,
            'failed': failed,
        }
