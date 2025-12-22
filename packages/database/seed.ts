import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Pollster data with 538 ratings
const POLLSTERS = [
  { name: 'Monmouth University', slug: 'monmouth-university', grade: 'A+', accuracy: 94.2, lean: 'neutral' },
  { name: 'Marist College', slug: 'marist-college', grade: 'A', accuracy: 93.1, lean: 'neutral' },
  { name: 'Quinnipiac University', slug: 'quinnipiac-university', grade: 'A', accuracy: 91.5, lean: 'neutral' },
  { name: 'Siena College', slug: 'siena-college', grade: 'A+', accuracy: 94.8, lean: 'neutral' },
  { name: 'New York Times/Siena', slug: 'nyt-siena', grade: 'A+', accuracy: 95.1, lean: 'neutral' },
  { name: 'Fox News', slug: 'fox-news', grade: 'A', accuracy: 90.2, lean: 'neutral' },
  { name: 'CNN/SSRS', slug: 'cnn-ssrs', grade: 'A', accuracy: 89.8, lean: 'neutral' },
  { name: 'ABC News/Washington Post', slug: 'abc-wapo', grade: 'A+', accuracy: 93.5, lean: 'neutral' },
  { name: 'CBS News/YouGov', slug: 'cbs-yougov', grade: 'A-', accuracy: 88.9, lean: 'neutral' },
  { name: 'NBC News/Marist', slug: 'nbc-marist', grade: 'A', accuracy: 91.2, lean: 'neutral' },
  { name: 'Emerson College', slug: 'emerson-college', grade: 'A-', accuracy: 88.5, lean: 'neutral' },
  { name: 'Morning Consult', slug: 'morning-consult', grade: 'B+', accuracy: 85.2, lean: 'neutral' },
  { name: 'YouGov', slug: 'yougov', grade: 'B+', accuracy: 84.8, lean: 'neutral' },
  { name: 'Ipsos', slug: 'ipsos', grade: 'B+', accuracy: 85.5, lean: 'neutral' },
  { name: 'SurveyUSA', slug: 'surveyusa', grade: 'A-', accuracy: 89.1, lean: 'neutral' },
  { name: 'Data for Progress', slug: 'data-for-progress', grade: 'B', accuracy: 82.3, lean: 'D+1.5' },
  { name: 'Trafalgar Group', slug: 'trafalgar-group', grade: 'C-', accuracy: 78.2, lean: 'R+2.5' },
  { name: 'Rasmussen Reports', slug: 'rasmussen-reports', grade: 'C+', accuracy: 79.8, lean: 'R+2.0' },
  { name: 'InsiderAdvantage', slug: 'insideradvantage', grade: 'C', accuracy: 80.1, lean: 'R+1.5' },
  { name: 'AtlasIntel', slug: 'atlasintel', grade: 'B', accuracy: 83.5, lean: 'neutral' },
]

// 2024 Race configurations
const RACES = [
  {
    slug: 'president-2024',
    name: '2024 Presidential Election',
    type: 'president',
    state: null,
    candidates: [
      { name: 'Donald Trump', party: 'R' },
      { name: 'Kamala Harris', party: 'D' },
    ],
    importance: 10,
    electoral: 538,
  },
  {
    slug: 'senate-az-2024',
    name: 'Arizona Senate 2024',
    type: 'senate',
    state: 'AZ',
    candidates: [
      { name: 'Ruben Gallego', party: 'D' },
      { name: 'Kari Lake', party: 'R' },
    ],
    importance: 9,
  },
  {
    slug: 'senate-nv-2024',
    name: 'Nevada Senate 2024',
    type: 'senate',
    state: 'NV',
    candidates: [
      { name: 'Jacky Rosen', party: 'D' },
      { name: 'Sam Brown', party: 'R' },
    ],
    importance: 8,
  },
  {
    slug: 'senate-pa-2024',
    name: 'Pennsylvania Senate 2024',
    type: 'senate',
    state: 'PA',
    candidates: [
      { name: 'Bob Casey', party: 'D' },
      { name: 'Dave McCormick', party: 'R' },
    ],
    importance: 9,
  },
  {
    slug: 'senate-mi-2024',
    name: 'Michigan Senate 2024',
    type: 'senate',
    state: 'MI',
    candidates: [
      { name: 'Elissa Slotkin', party: 'D' },
      { name: 'Mike Rogers', party: 'R' },
    ],
    importance: 8,
  },
  {
    slug: 'senate-wi-2024',
    name: 'Wisconsin Senate 2024',
    type: 'senate',
    state: 'WI',
    candidates: [
      { name: 'Tammy Baldwin', party: 'D' },
      { name: 'Eric Hovde', party: 'R' },
    ],
    importance: 8,
  },
  {
    slug: 'senate-oh-2024',
    name: 'Ohio Senate 2024',
    type: 'senate',
    state: 'OH',
    candidates: [
      { name: 'Sherrod Brown', party: 'D' },
      { name: 'Bernie Moreno', party: 'R' },
    ],
    importance: 9,
  },
  {
    slug: 'senate-mt-2024',
    name: 'Montana Senate 2024',
    type: 'senate',
    state: 'MT',
    candidates: [
      { name: 'Jon Tester', party: 'D' },
      { name: 'Tim Sheehy', party: 'R' },
    ],
    importance: 9,
  },
]

// Generate realistic poll data
function generatePolls(
  raceId: string,
  pollsterId: string,
  candidates: { name: string; party: string }[],
  baseMargin: number, // positive = D leads, negative = R leads
  volatility: number,
  startDate: Date,
  count: number
): any[] {
  const polls = []
  let currentDate = new Date(startDate)
  let margin = baseMargin

  for (let i = 0; i < count; i++) {
    // Add some random walk to the margin
    margin += (Math.random() - 0.5) * volatility
    margin = Math.max(-15, Math.min(15, margin)) // Clamp

    const dem = candidates.find(c => c.party === 'D')!
    const rep = candidates.find(c => c.party === 'R')!

    // Calculate percentages (assuming ~5% undecided/other)
    const basePercent = 47.5
    const demPercent = basePercent + margin / 2 + (Math.random() - 0.5) * 2
    const repPercent = basePercent - margin / 2 + (Math.random() - 0.5) * 2

    const sampleSize = 600 + Math.floor(Math.random() * 800)
    const moe = 2.5 + Math.random() * 2

    polls.push({
      raceId,
      pollsterId,
      pollDate: new Date(currentDate),
      sampleSize,
      methodology: ['phone', 'online', 'mixed'][Math.floor(Math.random() * 3)],
      populationType: 'lv',
      results: {
        [dem.name]: Math.round(demPercent * 10) / 10,
        [rep.name]: Math.round(repPercent * 10) / 10,
      },
      marginOfError: Math.round(moe * 10) / 10,
      confidenceLevel: 95,
      isPartisan: false,
      isOutlier: false,
      isVerified: true,
    })

    // Move to next poll date (2-5 days later)
    currentDate.setDate(currentDate.getDate() + 2 + Math.floor(Math.random() * 4))
  }

  return polls
}

async function main() {
  console.log('🌱 Starting comprehensive database seed...\n')

  // Clear existing data
  console.log('🗑️  Clearing existing data...')
  await prisma.forecast.deleteMany()
  await prisma.poll.deleteMany()
  await prisma.candidate.deleteMany()
  await prisma.race.deleteMany()
  await prisma.pollster.deleteMany()
  console.log('✅ Existing data cleared\n')

  // Seed Pollsters
  console.log('📊 Seeding pollsters...')
  const pollsterMap: Record<string, string> = {}

  for (const p of POLLSTERS) {
    const pollster = await prisma.pollster.create({
      data: {
        name: p.name,
        slug: p.slug,
        methodologyGrade: p.grade,
        overallAccuracy: p.accuracy,
        partisanLean: p.lean,
        pollCount: 0,
      },
    })
    pollsterMap[p.slug] = pollster.id
  }
  console.log(`✅ ${POLLSTERS.length} pollsters seeded\n`)

  // Seed Races with Candidates
  console.log('🗳️  Seeding races and candidates...')
  const raceMap: Record<string, { id: string; candidates: { name: string; party: string }[] }> = {}

  for (const r of RACES) {
    const race = await prisma.race.create({
      data: {
        slug: r.slug,
        raceName: r.name,
        raceType: r.type,
        country: 'USA',
        state: r.state,
        electionDate: new Date('2024-11-05'),
        status: 'active',
        importanceScore: r.importance,
        electoralVotes: r.electoral,
        candidates: {
          create: r.candidates.map(c => ({
            name: c.name,
            party: c.party,
            incumbent: false,
          })),
        },
      },
    })
    raceMap[r.slug] = { id: race.id, candidates: r.candidates }
  }
  console.log(`✅ ${RACES.length} races seeded\n`)

  // Seed Polls - Generate realistic polling history
  console.log('📋 Seeding polls (this may take a moment)...')
  let totalPolls = 0

  // Presidential race - many polls, tight race
  const presidentPolls: any[] = []
  const presRace = raceMap['president-2024']
  const pollsterSlugs = Object.keys(pollsterMap)

  // Generate ~100 polls from various pollsters over 6 months
  for (let month = 0; month < 6; month++) {
    const startDate = new Date('2024-06-01')
    startDate.setMonth(startDate.getMonth() + month)

    // Pick 3-5 random pollsters per month
    const monthPollsters = pollsterSlugs
      .sort(() => Math.random() - 0.5)
      .slice(0, 3 + Math.floor(Math.random() * 3))

    for (const pSlug of monthPollsters) {
      // Base margin varies by month (convention bumps, etc.)
      let baseMargin = 0
      if (month === 1) baseMargin = -2 // RNC bump for Trump
      if (month === 2) baseMargin = 3 // DNC bump for Harris
      if (month >= 4) baseMargin = 1 // Slight Harris lead late

      const polls = generatePolls(
        presRace.id,
        pollsterMap[pSlug],
        presRace.candidates,
        baseMargin,
        1.5,
        startDate,
        2 + Math.floor(Math.random() * 2)
      )
      presidentPolls.push(...polls)
    }
  }

  await prisma.poll.createMany({ data: presidentPolls })
  totalPolls += presidentPolls.length
  console.log(`  📊 President: ${presidentPolls.length} polls`)

  // Senate races - fewer polls each
  for (const [slug, race] of Object.entries(raceMap)) {
    if (slug === 'president-2024') continue

    const polls: any[] = []

    // Different margins for different races
    const margins: Record<string, number> = {
      'senate-az-2024': 4, // Gallego leads
      'senate-nv-2024': 6, // Rosen leads
      'senate-pa-2024': 3, // Casey leads
      'senate-mi-2024': 5, // Slotkin leads
      'senate-wi-2024': 4, // Baldwin leads
      'senate-oh-2024': -2, // Moreno leads
      'senate-mt-2024': -8, // Sheehy leads
    }

    // Generate ~25 polls per race
    for (let month = 0; month < 5; month++) {
      const startDate = new Date('2024-07-01')
      startDate.setMonth(startDate.getMonth() + month)

      const monthPollsters = pollsterSlugs
        .sort(() => Math.random() - 0.5)
        .slice(0, 2 + Math.floor(Math.random() * 2))

      for (const pSlug of monthPollsters) {
        const racePolls = generatePolls(
          race.id,
          pollsterMap[pSlug],
          race.candidates,
          margins[slug] || 0,
          2,
          startDate,
          1 + Math.floor(Math.random() * 2)
        )
        polls.push(...racePolls)
      }
    }

    await prisma.poll.createMany({ data: polls })
    totalPolls += polls.length
    console.log(`  📊 ${slug}: ${polls.length} polls`)
  }

  console.log(`✅ ${totalPolls} total polls seeded\n`)

  // Generate Forecasts
  console.log('🔮 Seeding forecasts...')

  for (const [slug, race] of Object.entries(raceMap)) {
    const dem = race.candidates.find(c => c.party === 'D')!
    const rep = race.candidates.find(c => c.party === 'R')!

    // Calculate win probability based on expected margin
    const margins: Record<string, number> = {
      'president-2024': 1,
      'senate-az-2024': 4,
      'senate-nv-2024': 6,
      'senate-pa-2024': 3,
      'senate-mi-2024': 5,
      'senate-wi-2024': 4,
      'senate-oh-2024': -2,
      'senate-mt-2024': -8,
    }

    const margin = margins[slug] || 0
    // Convert margin to probability (rough approximation)
    const demProb = 0.5 + (margin / 100) * 3 // ~3% per point of margin

    await prisma.forecast.create({
      data: {
        raceId: race.id,
        forecastDate: new Date(),
        modelVersion: 'ultrathink-v1.0',
        probabilities: {
          [dem.name]: Math.round(demProb * 1000) / 1000,
          [rep.name]: Math.round((1 - demProb) * 1000) / 1000,
        },
        predictedMargins: {
          [dem.name]: margin > 0 ? `+${margin.toFixed(1)}` : margin.toFixed(1),
          [rep.name]: margin < 0 ? `+${Math.abs(margin).toFixed(1)}` : (-margin).toFixed(1),
        },
        predictedVoteShare: {
          [dem.name]: 48 + margin / 2,
          [rep.name]: 48 - margin / 2,
        },
        simulationsRun: 40000,
        volatilityIndex: 5 + Math.random() * 10,
        contributingPolls: Math.floor(totalPolls / RACES.length),
        pollQualityScore: 85 + Math.random() * 10,
      },
    })
  }
  console.log(`✅ ${RACES.length} forecasts seeded\n`)

  // Update pollster counts
  console.log('📈 Updating pollster statistics...')
  for (const [slug, id] of Object.entries(pollsterMap)) {
    const count = await prisma.poll.count({ where: { pollsterId: id } })
    await prisma.pollster.update({
      where: { id },
      data: { pollCount: count },
    })
  }
  console.log('✅ Pollster stats updated\n')

  // Update race aggregates
  console.log('📊 Updating race aggregates...')
  for (const [slug, race] of Object.entries(raceMap)) {
    const recentPolls = await prisma.poll.findMany({
      where: { raceId: race.id },
      orderBy: { pollDate: 'desc' },
      take: 10,
    })

    if (recentPolls.length > 0) {
      const dem = race.candidates.find(c => c.party === 'D')!
      const rep = race.candidates.find(c => c.party === 'R')!

      let demSum = 0, repSum = 0
      for (const poll of recentPolls) {
        const results = poll.results as Record<string, number>
        demSum += results[dem.name] || 0
        repSum += results[rep.name] || 0
      }

      const demAvg = demSum / recentPolls.length
      const repAvg = repSum / recentPolls.length
      const margin = demAvg - repAvg
      const leader = margin > 0 ? dem.name : rep.name

      let rating = 'tossup'
      const absMargin = Math.abs(margin)
      if (absMargin > 10) rating = margin > 0 ? 'safe_d' : 'safe_r'
      else if (absMargin > 6) rating = margin > 0 ? 'likely_d' : 'likely_r'
      else if (absMargin > 3) rating = margin > 0 ? 'lean_d' : 'lean_r'

      await prisma.race.update({
        where: { id: race.id },
        data: {
          currentLeader: leader,
          currentMargin: Math.round(margin * 10) / 10,
          competitiveRating: rating,
        },
      })
    }
  }
  console.log('✅ Race aggregates updated\n')

  // Final summary
  console.log('═'.repeat(50))
  console.log('🎉 DATABASE SEED COMPLETED SUCCESSFULLY!')
  console.log('═'.repeat(50))
  console.log('')
  console.log('Summary:')
  console.log(`  📊 ${POLLSTERS.length} pollsters`)
  console.log(`  🗳️  ${RACES.length} races`)
  console.log(`  📋 ${totalPolls} polls`)
  console.log(`  🔮 ${RACES.length} forecasts`)
  console.log('')
  console.log('Ready to go! 🚀')
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
