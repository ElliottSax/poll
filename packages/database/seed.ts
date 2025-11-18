import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Seed Pollsters
  console.log('📊 Seeding pollsters...')
  const monmouth = await prisma.pollster.upsert({
    where: { slug: 'monmouth' },
    update: {},
    create: {
      name: 'Monmouth University',
      slug: 'monmouth',
      organization: 'Monmouth University Polling Institute',
      website: 'https://monmouth.edu/polling',
      overallAccuracy: 94.2,
      methodologyGrade: 'A+',
      transparencyScore: 0.95,
      sampleSizeAvg: 825,
      partisanLean: 'neutral',
      pollCount: 0,
    },
  })

  const quinnipiac = await prisma.pollster.upsert({
    where: { slug: 'quinnipiac' },
    update: {},
    create: {
      name: 'Quinnipiac University',
      slug: 'quinnipiac',
      organization: 'Quinnipiac University Poll',
      website: 'https://poll.qu.edu',
      overallAccuracy: 91.5,
      methodologyGrade: 'A-',
      transparencyScore: 0.92,
      sampleSizeAvg: 1050,
      partisanLean: 'neutral',
      pollCount: 0,
    },
  })

  const emerson = await prisma.pollster.upsert({
    where: { slug: 'emerson' },
    update: {},
    create: {
      name: 'Emerson College',
      slug: 'emerson',
      organization: 'Emerson College Polling',
      website: 'https://emersonpolling.com',
      overallAccuracy: 90.8,
      methodologyGrade: 'A-',
      transparencyScore: 0.88,
      sampleSizeAvg: 950,
      partisanLean: 'neutral',
      pollCount: 0,
    },
  })

  const rasmussen = await prisma.pollster.upsert({
    where: { slug: 'rasmussen' },
    update: {},
    create: {
      name: 'Rasmussen Reports',
      slug: 'rasmussen',
      organization: 'Rasmussen Reports',
      website: 'https://rasmussenreports.com',
      overallAccuracy: 82.1,
      methodologyGrade: 'C+',
      transparencyScore: 0.65,
      sampleSizeAvg: 1200,
      partisanLean: 'R+2.0',
      pollCount: 0,
    },
  })

  console.log('✅ Pollsters seeded')

  // Seed Races
  console.log('🗳️  Seeding races...')
  const presidentialRace = await prisma.race.upsert({
    where: { slug: '2024-presidential' },
    update: {},
    create: {
      raceType: 'president',
      raceName: '2024 Presidential Election',
      slug: '2024-presidential',
      country: 'USA',
      electionDate: new Date('2024-11-05'),
      status: 'upcoming',
      candidates: [
        { id: '1', name: 'Joe Biden', party: 'D', incumbent: true },
        { id: '2', name: 'Donald Trump', party: 'R', incumbent: false },
      ],
      competitiveRating: 'tossup',
      importanceScore: 10,
      electoralVotes: 538,
      description: 'The 2024 United States presidential election',
    },
  })

  const paSenate = await prisma.race.upsert({
    where: { slug: 'pa-senate-2024' },
    update: {},
    create: {
      raceType: 'senate',
      raceName: 'Pennsylvania Senate 2024',
      slug: 'pa-senate-2024',
      country: 'USA',
      state: 'PA',
      electionDate: new Date('2024-11-05'),
      status: 'upcoming',
      candidates: [
        { id: '1', name: 'Bob Casey', party: 'D', incumbent: true },
        { id: '2', name: 'Dave McCormick', party: 'R', incumbent: false },
      ],
      competitiveRating: 'lean_d',
      importanceScore: 9,
      description: 'Pennsylvania U.S. Senate race',
    },
  })

  const gaSenate = await prisma.race.upsert({
    where: { slug: 'ga-senate-2024' },
    update: {},
    create: {
      raceType: 'senate',
      raceName: 'Georgia Senate 2024',
      slug: 'ga-senate-2024',
      country: 'USA',
      state: 'GA',
      electionDate: new Date('2024-11-05'),
      status: 'upcoming',
      candidates: [
        { id: '1', name: 'Raphael Warnock', party: 'D', incumbent: true },
        { id: '2', name: 'Herschel Walker', party: 'R', incumbent: false },
      ],
      competitiveRating: 'tossup',
      importanceScore: 9,
      description: 'Georgia U.S. Senate race',
    },
  })

  console.log('✅ Races seeded')

  // Seed Polls
  console.log('📋 Seeding polls...')
  const poll1 = await prisma.poll.create({
    data: {
      raceId: presidentialRace.id,
      pollsterId: monmouth.id,
      pollDate: new Date('2024-01-14'),
      fieldDateStart: new Date('2024-01-10'),
      fieldDateEnd: new Date('2024-01-13'),
      sampleSize: 892,
      methodology: 'phone',
      populationType: 'lv',
      results: {
        'Joe Biden': 48.2,
        'Donald Trump': 47.8,
        Other: 2.1,
        Undecided: 1.9,
      },
      marginOfError: 3.4,
      confidenceLevel: 95,
      isPartisan: false,
      isOutlier: false,
      isVerified: true,
      sourceUrl: 'https://example.com/poll1',
    },
  })

  const poll2 = await prisma.poll.create({
    data: {
      raceId: paSenate.id,
      pollsterId: quinnipiac.id,
      pollDate: new Date('2024-01-12'),
      fieldDateStart: new Date('2024-01-08'),
      fieldDateEnd: new Date('2024-01-11'),
      sampleSize: 1050,
      methodology: 'phone',
      populationType: 'lv',
      results: {
        'Bob Casey': 49.5,
        'Dave McCormick': 45.2,
        Other: 2.3,
        Undecided: 3.0,
      },
      marginOfError: 3.0,
      confidenceLevel: 95,
      isPartisan: false,
      isOutlier: false,
      isVerified: true,
      sourceUrl: 'https://example.com/poll2',
    },
  })

  const poll3 = await prisma.poll.create({
    data: {
      raceId: gaSenate.id,
      pollsterId: emerson.id,
      pollDate: new Date('2024-01-11'),
      fieldDateStart: new Date('2024-01-07'),
      fieldDateEnd: new Date('2024-01-10'),
      sampleSize: 950,
      methodology: 'online',
      populationType: 'lv',
      results: {
        'Raphael Warnock': 48.7,
        'Herschel Walker': 48.1,
        Other: 1.8,
        Undecided: 1.4,
      },
      marginOfError: 3.2,
      confidenceLevel: 95,
      isPartisan: false,
      isOutlier: false,
      isVerified: true,
      sourceUrl: 'https://example.com/poll3',
    },
  })

  console.log('✅ Polls seeded')

  // Seed Forecasts
  console.log('🔮 Seeding forecasts...')
  const forecast1 = await prisma.forecast.create({
    data: {
      raceId: presidentialRace.id,
      forecastDate: new Date('2024-01-15'),
      modelVersion: 'v1.0.0',
      probabilities: {
        'Joe Biden': 0.523,
        'Donald Trump': 0.467,
        other: 0.010,
      },
      predictedMargins: {
        'Joe Biden': '+1.2',
        'Donald Trump': '-1.2',
      },
      predictedVoteShare: {
        'Joe Biden': 50.6,
        'Donald Trump': 49.4,
      },
      simulationsRun: 10000,
      volatilityIndex: 12.5,
      contributingPolls: 127,
      pollQualityScore: 87.3,
    },
  })

  const forecast2 = await prisma.forecast.create({
    data: {
      raceId: paSenate.id,
      forecastDate: new Date('2024-01-15'),
      modelVersion: 'v1.0.0',
      probabilities: {
        'Bob Casey': 0.689,
        'Dave McCormick': 0.311,
      },
      predictedMargins: {
        'Bob Casey': '+4.3',
        'Dave McCormick': '-4.3',
      },
      predictedVoteShare: {
        'Bob Casey': 52.2,
        'Dave McCormick': 47.8,
      },
      simulationsRun: 10000,
      volatilityIndex: 8.7,
      contributingPolls: 23,
      pollQualityScore: 91.2,
    },
  })

  console.log('✅ Forecasts seeded')

  console.log('🎉 Database seed completed successfully!')
  console.log('')
  console.log('Summary:')
  console.log(`  - ${4} pollsters created`)
  console.log(`  - ${3} races created`)
  console.log(`  - ${3} polls created`)
  console.log(`  - ${2} forecasts created`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:')
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
