-- CreateTable
CREATE TABLE "races" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT,
    "office" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "electionDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'active',
    "importanceScore" INTEGER NOT NULL DEFAULT 50,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "races_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pollsters" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "grade" TEXT,
    "accuracyScore" DOUBLE PRECISION,
    "methodologyScore" DOUBLE PRECISION,
    "transparency" DOUBLE PRECISION,
    "houseEffect" DOUBLE PRECISION,
    "partisanLean" TEXT,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pollsters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "polls" (
    "id" TEXT NOT NULL,
    "raceId" TEXT NOT NULL,
    "pollsterId" TEXT NOT NULL,
    "pollDate" TIMESTAMP(3) NOT NULL,
    "sampleSize" INTEGER,
    "marginOfError" DOUBLE PRECISION,
    "population" TEXT NOT NULL DEFAULT 'LV',
    "methodology" TEXT NOT NULL DEFAULT 'mixed',
    "partisan" TEXT,
    "results" JSONB NOT NULL,
    "url" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "polls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "party" TEXT NOT NULL,
    "incumbent" BOOLEAN NOT NULL DEFAULT false,
    "photoUrl" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_races" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "raceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_races_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forecasts" (
    "id" TEXT NOT NULL,
    "raceId" TEXT NOT NULL,
    "forecastDate" TIMESTAMP(3) NOT NULL,
    "modelVersion" TEXT NOT NULL DEFAULT '1.0',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forecasts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forecast_results" (
    "id" TEXT NOT NULL,
    "forecastId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "projectedPercentage" DOUBLE PRECISION NOT NULL,
    "winProbability" DOUBLE PRECISION NOT NULL,
    "lowerBound" DOUBLE PRECISION NOT NULL,
    "upperBound" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forecast_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    "avatar" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scenarios" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "adjustments" JSONB NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scenarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "predictions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "raceId" TEXT NOT NULL,
    "predictedWinner" TEXT NOT NULL,
    "predictedMargin" DOUBLE PRECISION,
    "confidence" DOUBLE PRECISION,
    "isCorrect" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "predictions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "races_slug_key" ON "races"("slug");

-- CreateIndex
CREATE INDEX "races_slug_idx" ON "races"("slug");

-- CreateIndex
CREATE INDEX "races_state_office_year_idx" ON "races"("state", "office", "year");

-- CreateIndex
CREATE INDEX "races_importanceScore_idx" ON "races"("importanceScore");

-- CreateIndex
CREATE UNIQUE INDEX "pollsters_slug_key" ON "pollsters"("slug");

-- CreateIndex
CREATE INDEX "pollsters_slug_idx" ON "pollsters"("slug");

-- CreateIndex
CREATE INDEX "pollsters_name_idx" ON "pollsters"("name");

-- CreateIndex
CREATE INDEX "polls_raceId_idx" ON "polls"("raceId");

-- CreateIndex
CREATE INDEX "polls_pollsterId_idx" ON "polls"("pollsterId");

-- CreateIndex
CREATE INDEX "polls_pollDate_idx" ON "polls"("pollDate");

-- CreateIndex
CREATE INDEX "candidates_name_idx" ON "candidates"("name");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_races_candidateId_raceId_key" ON "candidate_races"("candidateId", "raceId");

-- CreateIndex
CREATE INDEX "candidate_races_raceId_idx" ON "candidate_races"("raceId");

-- CreateIndex
CREATE INDEX "forecasts_raceId_idx" ON "forecasts"("raceId");

-- CreateIndex
CREATE INDEX "forecasts_forecastDate_idx" ON "forecasts"("forecastDate");

-- CreateIndex
CREATE INDEX "forecast_results_forecastId_idx" ON "forecast_results"("forecastId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "scenarios_userId_idx" ON "scenarios"("userId");

-- CreateIndex
CREATE INDEX "scenarios_isPublic_idx" ON "scenarios"("isPublic");

-- CreateIndex
CREATE INDEX "predictions_userId_idx" ON "predictions"("userId");

-- CreateIndex
CREATE INDEX "predictions_raceId_idx" ON "predictions"("raceId");

-- AddForeignKey
ALTER TABLE "polls" ADD CONSTRAINT "polls_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "races"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "polls" ADD CONSTRAINT "polls_pollsterId_fkey" FOREIGN KEY ("pollsterId") REFERENCES "pollsters"("id") ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_races" ADD CONSTRAINT "candidate_races_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_races" ADD CONSTRAINT "candidate_races_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "races"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forecasts" ADD CONSTRAINT "forecasts_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "races"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forecast_results" ADD CONSTRAINT "forecast_results_forecastId_fkey" FOREIGN KEY ("forecastId") REFERENCES "forecasts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forecast_results" ADD CONSTRAINT "forecast_results_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenarios" ADD CONSTRAINT "scenarios_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
