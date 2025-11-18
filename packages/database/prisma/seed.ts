/**
 * Database Seed Script
 *
 * Run with: npm run db:seed
 */

import { PrismaClient, RaceType, RaceStatus, PollMethodology, PopulationType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clean existing data (development only!)
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Cleaning existing data...')
    await prisma.prediction.deleteMany()
    await prisma.scenario.deleteMany()
    await prisma.apiKey.deleteMany()
    await prisma.user.deleteMany()
    await prisma.alert.deleteMany()
    await prisma.result.deleteMany()
    await prisma.forecast.deleteMany()
    await prisma.poll.deleteMany()
    await prisma.pollster.deleteMany()
    await prisma.race.deleteMany()
  }

  // ============================================
  // Seed Pollsters
  // ============================================
  console.log('📊 Creating pollsters...')

  const pollsters = await Promise.all([
    prisma.pollster.create({
      data: {
        name: 'Quinnipiac University',
        slug: 'quinnipiac',
        organization: 'Quinnipiac University Poll',
        website: 'https://poll.qu.edu',
        overallAccuracy: 85.5,
        methodologyGrade: 'A-',
        transparencyScore: 0.95,
        sampleSizeAvg: 1200,
        partisanLean: 'neutral',
        pollCount: 0,
      },
    }),
    prisma.pollster.create({
      data: {
        name: 'Marist College',
        slug: 'marist',
        organization: 'Marist Poll',
        website: 'https://maristpoll.marist.edu',
        overallAccuracy: 88.2,
        methodologyGrade: 'A',
        transparencyScore: 0.98,
        sampleSizeAvg: 1100,
        partisanLean: 'neutral',
        pollCount: 0,
      },
    }),
    prisma.pollster.create({
      data: {
        name: 'Siena College',
        slug: 'siena',
        organization: 'Siena College Research Institute',
        website: 'https://scri.siena.edu',
        overallAccuracy: 87.0,
        methodologyGrade: 'A',
        transparencyScore: 0.96,
        sampleSizeAvg: 800,
        partisanLean: 'neutral',
        pollCount: 0,
      },
    }),
    prisma.pollster.create({
      data: {
        name: 'Emerson College',
        slug: 'emerson',
        organization: 'Emerson College Polling',
        website: 'https://www.emerson.edu/polling',
        overallAccuracy: 82.5,
        methodologyGrade: 'B+',
        transparencyScore: 0.90,
        sampleSizeAvg: 1000,
        partisanLean: 'neutral',
        pollCount: 0,
      },
    }),
    prisma.pollster.create({
      data: {
        name: 'Monmouth University',
        slug: 'monmouth',
        organization: 'Monmouth University Polling Institute',
        website: 'https://www.monmouth.edu/polling-institute/',
        overallAccuracy: 89.0,
        methodologyGrade: 'A+',
        transparencyScore: 0.99,
        sampleSizeAvg: 800,
        partisanLean: 'neutral',
        pollCount: 0,
      },
    }),
  ])

  console.log(`✅ Created ${pollsters.length} pollsters`)

  // ============================================
  // Seed Races
  // ============================================
  console.log('🏁 Creating races...')

  const presidentialRace = await prisma.race.create({
    data: {
      raceType: RaceType.PRESIDENT,
      raceName: '2024 United States Presidential Election',
      slug: '2024-presidential',
      country: 'USA',
      electionDate: new Date('2024-11-05'),
      status: RaceStatus.ACTIVE,
      candidates: {
        candidates: [
          {
            id: 'biden-2024',
            name: 'Joe Biden',
            party: 'D',
            incumbent: true,
          },
          {
            id: 'trump-2024',
            name: 'Donald Trump',
            party: 'R',
            incumbent: false,
          },
          {
            id: 'kennedy-2024',
            name: 'Robert F. Kennedy Jr.',
            party: 'I',
            incumbent: false,
          },
        ],
      },
      currentLeader: 'Joe Biden',
      competitiveRating: 'Toss-up',
      importanceScore: 10,
      description: 'The 2024 United States presidential election',
    },
  })

  const paSenateRace = await prisma.race.create({
    data: {
      raceType: RaceType.SENATE,
      raceName: 'Pennsylvania Senate',
      slug: 'pa-senate-2024',
      country: 'USA',
      state: 'PA',
      electionDate: new Date('2024-11-05'),
      status: RaceStatus.ACTIVE,
      candidates: {
        candidates: [
          {
            id: 'casey-2024',
            name: 'Bob Casey',
            party: 'D',
            incumbent: true,
          },
          {
            id: 'mccormick-2024',
            name: 'Dave McCormick',
            party: 'R',
            incumbent: false,
          },
        ],
      },
      currentLeader: 'Bob Casey',
      competitiveRating: 'Lean D',
      importanceScore: 9,
      description: 'Pennsylvania U.S. Senate race',
    },
  })

  const gaSenatRace = await prisma.race.create({
    data: {
      raceType: RaceType.SENATE,
      raceName: 'Georgia Senate',
      slug: 'ga-senate-2024',
      country: 'USA',
      state: 'GA',
      electionDate: new Date('2024-11-05'),
      status: RaceStatus.ACTIVE,
      candidates: {
        candidates: [
          {
            id: 'warnock-2024',
            name: 'Raphael Warnock',
            party: 'D',
            incumbent: true,
          },
          {
            id: 'walker-2024',
            name: 'Herschel Walker',
            party: 'R',
            incumbent: false,
          },
        ],
      },
      currentLeader: 'Raphael Warnock',
      competitiveRating: 'Toss-up',
      importanceScore: 10,
      description: 'Georgia U.S. Senate race',
    },
  })

  const azSenateRace = await prisma.race.create({
    data: {
      raceType: RaceType.SENATE,
      raceName: 'Arizona Senate',
      slug: 'az-senate-2024',
      country: 'USA',
      state: 'AZ',
      electionDate: new Date('2024-11-05'),
      status: RaceStatus.ACTIVE,
      candidates: {
        candidates: [
          {
            id: 'kelly-2024',
            name: 'Mark Kelly',
            party: 'D',
            incumbent: true,
          },
          {
            id: 'masters-2024',
            name: 'Blake Masters',
            party: 'R',
            incumbent: false,
          },
        ],
      },
      currentLeader: 'Mark Kelly',
      competitiveRating: 'Lean D',
      importanceScore: 8,
      description: 'Arizona U.S. Senate race',
    },
  })

  console.log('✅ Created 4 races')

  // ============================================
  // Seed Polls
  // ============================================
  console.log('📈 Creating polls...')

  const pollsData = [
    // Presidential polls
    {
      race: presidentialRace,
      pollster: pollsters[0], // Quinnipiac
      pollDate: new Date('2024-01-15'),
      sampleSize: 1200,
      methodology: PollMethodology.PHONE,
      populationType: PopulationType.LV,
      results: {
        'Joe Biden': 48.5,
        'Donald Trump': 47.2,
        'Robert F. Kennedy Jr.': 2.1,
        Undecided: 2.2,
      },
      marginOfError: 2.8,
    },
    {
      race: presidentialRace,
      pollster: pollsters[1], // Marist
      pollDate: new Date('2024-01-18'),
      sampleSize: 1100,
      methodology: PollMethodology.PHONE,
      populationType: PopulationType.RV,
      results: {
        'Joe Biden': 49.0,
        'Donald Trump': 46.5,
        'Robert F. Kennedy Jr.': 2.5,
        Undecided: 2.0,
      },
      marginOfError: 3.0,
    },
    // Pennsylvania Senate polls
    {
      race: paSenateRace,
      pollster: pollsters[2], // Siena
      pollDate: new Date('2024-01-10'),
      sampleSize: 800,
      methodology: PollMethodology.PHONE,
      populationType: PopulationType.LV,
      results: {
        'Bob Casey': 51.0,
        'Dave McCormick': 44.0,
        Undecided: 5.0,
      },
      marginOfError: 3.5,
    },
    {
      race: paSenateRace,
      pollster: pollsters[4], // Monmouth
      pollDate: new Date('2024-01-20'),
      sampleSize: 800,
      methodology: PollMethodology.PHONE,
      populationType: PopulationType.LV,
      results: {
        'Bob Casey': 50.5,
        'Dave McCormick': 45.5,
        Undecided: 4.0,
      },
      marginOfError: 3.5,
    },
    // Georgia Senate polls
    {
      race: gaSenatRace,
      pollster: pollsters[3], // Emerson
      pollDate: new Date('2024-01-12'),
      sampleSize: 1000,
      methodology: PollMethodology.ONLINE,
      populationType: PopulationType.LV,
      results: {
        'Raphael Warnock': 49.5,
        'Herschel Walker': 48.0,
        Undecided: 2.5,
      },
      marginOfError: 3.1,
    },
  ]

  for (const pollData of pollsData) {
    await prisma.poll.create({
      data: {
        raceId: pollData.race.id,
        pollsterId: pollData.pollster.id,
        pollDate: pollData.pollDate,
        sampleSize: pollData.sampleSize,
        methodology: pollData.methodology,
        populationType: pollData.populationType,
        results: pollData.results,
        marginOfError: pollData.marginOfError,
        transparencyScore: 0.95,
        sourceUrl: `https://example.com/poll/${pollData.pollster.slug}`,
      },
    })

    // Update pollster counts
    await prisma.pollster.update({
      where: { id: pollData.pollster.id },
      data: {
        pollCount: { increment: 1 },
        lastPollDate: pollData.pollDate,
        firstPollDate:
          pollData.pollster.firstPollDate || pollData.pollDate,
      },
    })
  }

  console.log(`✅ Created ${pollsData.length} polls`)

  // ============================================
  // Seed Users
  // ============================================
  console.log('👤 Creating demo users...')

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@pollingdashboard.com',
      username: 'demo_user',
      displayName: 'Demo User',
      isVerified: true,
      trackedRaces: [presidentialRace.id, paSenateRace.id],
      notificationPreferences: {
        email: true,
        push: false,
        types: ['RATING_CHANGE', 'FORECAST_SHIFT'],
      },
    },
  })

  console.log('✅ Created demo user')

  // ============================================
  // Summary
  // ============================================
  console.log('\n🎉 Seed completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`   - ${pollsters.length} pollsters`)
  console.log(`   - 4 races`)
  console.log(`   - ${pollsData.length} polls`)
  console.log(`   - 1 demo user`)
  console.log('\n💡 Demo user login:')
  console.log(`   Email: ${demoUser.email}`)
  console.log(`   Username: ${demoUser.username}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
