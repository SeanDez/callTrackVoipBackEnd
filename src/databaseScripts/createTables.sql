-- local command
-- psql -h localhost -U username -d dataBase -a -f fullFilePath

-- remote command
-- psql -h {host} -U username -d dataBase -a -f fullFilePath

BEGIN;

CREATE TABLE IF NOT EXISTS "app_user" (
  "id" SERIAL primary key,
  "user_name" TEXT unique not null,
  "password_hash" TEXT not null,
  "voipms_user_email" TEXT,
  "voipms_password_encrypted" TEXT
);

CREATE TABLE IF NOT EXISTS "campaign" (
  "id" SERIAL primary key,
  "phoneNumber" TEXT not null unique,
  "name" TEXT,
  "status" TEXT,
  "app_user_id" INTEGER REFERENCES "app_user" (id) on delete cascade
);

CREATE TABLE IF NOT EXISTS "call" (
  "id" SERIAL primary key,
  "unique_id" TEXT not null,
  "caller_id" TEXT,
  "date" DATE,
  "description" TEXT,
  "account" TEXT,
  "disposition" TEXT,
  "seconds" SMALLINT,
  "campaign_id" INTEGER REFERENCES "campaign" (id) on delete cascade
);

COMMIT;