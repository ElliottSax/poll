import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create Pollsters
  console.log('Creating pollsters...')
  const emerson = await prisma.pollster.upsert({
    where: { slug: 'emerson-college' },
    update: {},
    create: {
      slug: 'emerson-college',
      name: 'Emerson College',
      grade: 'A-',
      accuracyScore: 0.85,
      methodologyScore: 0.90,
      transparency: 0.95,
      website: 'https://www.emerson.edu/polling',
    },
  })

  const siena = await prisma.pollster.upsert({
    where: { slug: 'siena-college' },
    update: {},
    create: {
      slug: 'siena-college',
      name: 'Siena College',
      grade: 'A',
      accuracyScore: 0.90,
      methodologyScore: 0.92,
      transparency: 0.98,
      website: 'https://scri.siena.edu/',
    },
  })

  const marist = await prisma.pollster.upsert({
    where: { slug: 'marist' },
    update: {},
    create: {
      slug: 'marist',
      name: 'Marist',
      grade: 'A+',
      accuracyScore: 0.95,
      methodologyScore: 0.95,
      transparency: 1.0,
      website: 'https://maristpoll.marist.edu/',
    },
  })

  console.log(`Created ${[emerson, siena, marist].length} pollsters`)

  // Create Candidates
  console.log('Creating candidates...')
  const trump = await prisma.candidate.upsert({
    where: { id: 'candidate-trump' },
    update: {},
    create: {
      id: 'candidate-trump',
      name: 'Donald Trump',
      party: 'Republican',
      incumbent: false,
    },
  })

  const harris = await prisma.candidate.upsert({
    where: { id: 'candidate-harris' },
    update: {},
    create: {
      id: 'candidate-harris',
      name: 'Kamala Harris',
      party: 'Democratic',
      incumbent: true,
    },
  })

  console.log(`Created ${[trump, harris].length} candidates`)

  // Create Races
  console.log('Creating races...')
  const presidentialRace = await prisma.race.upsert({
    where: { slug: '2024-president-general' },
    update: {},
    create: {
      slug: '2024-president-general',
      title: '2024 Presidential Election',
      state: 'US',
      office: 'President',
      year: 2024,
      electionDate: new Date('2024-11-05'),
      description: '2024 United States Presidential Election',
      featured: true,
      status: 'active',
      importanceScore: 100,
    },
  })

  const paRace = await prisma.race.upsert({
    where: { slug: '2024-president-pennsylvania' },
    update: {},
    create: {
      slug: '2024-president-pennsylvania',
      title: '2024 Presidential Election - Pennsylvania',
      state: 'PA',
      office: 'President',
      year: 2024,
      electionDate: new Date('2024-11-05'),
      description: 'Pennsylvania is a key swing state with 19 electoral votes',
      featured: true,
      status: 'active',
      importanceScore: 95,
    },
  })

  const miRace = await prisma.race.upsert({
    where: { slug: '2024-president-michigan' },
    update: {},
    create: {
      slug: '2024-president-michigan',
      title: '2024 Presidential Election - Michigan',
      state: 'MI',
      office: 'President',
      year: 2024,
      electionDate: new Date('2024-11-05'),
      description: 'Michigan swing state with 15 electoral votes',
      featured: true,
      status: 'active',
      importanceScore: 90,
    },
  })

  console.log(`Created ${[presidentialRace, paRace, miRace].length} races`)

  // Link candidates to races
  console.log('Linking candidates to races...')
  for (const race of [presidentialRace, paRace, miRace]) {
    await prisma.candidateRace.upsert({
      where: {
        candidateId_raceId: {
          candidateId: trump.id,
          raceId: race.id,
        },
      },
      update: {},
      create: {
        candidateId: trump.id,
        raceId: race.id,
      },
    })

    await prisma.candidateRace.upsert({
      where: {
        candidateId_raceId: {
          candidateId: harris.id,
          raceId: race.id,
        },
      },
      update: {},
      create: {
        candidateId: harris.id,
        raceId: race.id,
      },
    })
  }

  // Create sample polls
  console.log('Creating sample polls...')
  const samplePolls = [
    {
      race: presidentialRace,
      pollster: emerson,
      date: new Date('2024-11-10'),
      results: { 'Trump': 48.5, 'Harris': 47.2 },
      sampleSize: 1000,
    },
    {
      race: presidentialRace,
      pollster: siena,
      date: new Date('2024-11-12'),
      results: { 'Trump': 47.8, 'Harris': 48.5 },
      sampleSize: 1200,
    },
    {
      race: paRace,
      pollster: marist,
      date: new Date('2024-11-11'),
      results: { 'Trump': 48.0, 'Harris': 49.0 },
      sampleSize: 850,
    },
    {
      race: miRace,
      pollster: emerson,
      date: new Date('2024-11-09'),
      results: { 'Trump': 47.5, 'Harris': 48.8 },
      sampleSize: 950,
    },
  ]

  for (const pollData of samplePolls) {
    await prisma.poll.create({
      data: {
        raceId: pollData.race.id,
        pollsterId: pollData.pollster.id,
        pollDate: pollData.date,
        sampleSize: pollData.sampleSize,
        population: 'LV',
        methodology: 'mixed',
        results: pollData.results,
      },
    })
  }

  console.log(`Created ${samplePolls.length} sample polls`)

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
