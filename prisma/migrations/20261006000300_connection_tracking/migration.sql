CREATE TYPE "ConnectionStatus" AS ENUM ('WANT_TO_TALK', 'TALKED_TO');

-- Existing favorites become contacts the member wants to talk to.
ALTER TABLE "Favorite"
ADD COLUMN "status" "ConnectionStatus" NOT NULL DEFAULT 'WANT_TO_TALK',
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
