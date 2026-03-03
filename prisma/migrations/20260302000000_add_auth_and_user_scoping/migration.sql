-- CreateTable: Better Auth user table
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateTable: Better Auth session table
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateTable: Better Auth account table
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Better Auth verification table
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable: UserFeature for dynamic feature system
CREATE TABLE "UserFeature" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserFeature_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserFeature_userId_featureId_key" ON "UserFeature"("userId", "featureId");
CREATE INDEX "UserFeature_userId_idx" ON "UserFeature"("userId");

-- Add userId to existing tables (nullable first for migration)
ALTER TABLE "Person" ADD COLUMN "userId" TEXT;
ALTER TABLE "Interaction" ADD COLUMN "userId" TEXT;
ALTER TABLE "FollowUp" ADD COLUMN "userId" TEXT;
ALTER TABLE "Event" ADD COLUMN "userId" TEXT;
ALTER TABLE "Paper" ADD COLUMN "userId" TEXT;
ALTER TABLE "Positioning" ADD COLUMN "userId" TEXT;
ALTER TABLE "CalendarSync" ADD COLUMN "userId" TEXT;

-- Tag: add userId, drop old unique, add new unique
ALTER TABLE "Tag" ADD COLUMN "userId" TEXT;
DROP INDEX IF EXISTS "Tag_name_key";

-- CalendarSync: drop old unique
DROP INDEX IF EXISTS "CalendarSync_provider_key";

-- Create default user for existing data migration
INSERT INTO "user" ("id", "name", "email", "emailVerified", "createdAt", "updatedAt")
VALUES ('migration-default-user', 'Migration User', 'migration@orbit.local', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Assign existing data to default user
UPDATE "Person" SET "userId" = 'migration-default-user' WHERE "userId" IS NULL;
UPDATE "Interaction" SET "userId" = 'migration-default-user' WHERE "userId" IS NULL;
UPDATE "FollowUp" SET "userId" = 'migration-default-user' WHERE "userId" IS NULL;
UPDATE "Event" SET "userId" = 'migration-default-user' WHERE "userId" IS NULL;
UPDATE "Paper" SET "userId" = 'migration-default-user' WHERE "userId" IS NULL;
UPDATE "Positioning" SET "userId" = 'migration-default-user' WHERE "userId" IS NULL;
UPDATE "CalendarSync" SET "userId" = 'migration-default-user' WHERE "userId" IS NULL;
UPDATE "Tag" SET "userId" = 'migration-default-user' WHERE "userId" IS NULL;

-- Make userId NOT NULL
ALTER TABLE "Person" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Interaction" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "FollowUp" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Event" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Paper" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Positioning" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "CalendarSync" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Tag" ALTER COLUMN "userId" SET NOT NULL;

-- Add unique constraint for Tag (userId, name)
CREATE UNIQUE INDEX "Tag_userId_name_key" ON "Tag"("userId", "name");

-- Add unique constraint for CalendarSync (userId, provider)
CREATE UNIQUE INDEX "CalendarSync_userId_provider_key" ON "CalendarSync"("userId", "provider");

-- Create indexes for userId
CREATE INDEX "Person_userId_idx" ON "Person"("userId");
CREATE INDEX "Interaction_userId_idx" ON "Interaction"("userId");
CREATE INDEX "FollowUp_userId_idx" ON "FollowUp"("userId");
CREATE INDEX "Event_userId_idx" ON "Event"("userId");
CREATE INDEX "Paper_userId_idx" ON "Paper"("userId");
CREATE INDEX "Positioning_userId_idx" ON "Positioning"("userId");
CREATE INDEX "CalendarSync_userId_idx" ON "CalendarSync"("userId");
CREATE INDEX "Tag_userId_idx" ON "Tag"("userId");

-- Add foreign keys for Better Auth
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserFeature" ADD CONSTRAINT "UserFeature_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
