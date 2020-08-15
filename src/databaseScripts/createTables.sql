-- local command
-- psql -h localhost -U "{username}" -d "{dataBase}" -a -f {fullFilePath}

-- remote command
-- psql -h {host} -U "{username}" -d "{dataBase}" -a -f {fullFilePath}

CREATE TABLE IF NOT EXISTS "app_user" (
  "id" SERIAL primary key,
  "user_name" VARCHAR(50) unique not null,
  "password_hash" VARCHAR(50) not null,
  "voipms_user_email" VARCHAR(50),
  "voipms_password_encrypted" VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS "campaign" (
  "phoneNumber" INTEGER not null primary key,
  "name" VARCHAR(100),
  "status" VARCHAR(30),
  "app_user_id" INTEGER REFERENCES "app_user" (id) on delete cascade
);

CREATE TABLE IF NOT EXISTS "call" (
  "uniqueId" INTEGER not null primary key,
  "callerId" VARCHAR(11),
  "date" DATE,
  "description" VARCHAR(80),
  "account" VARCHAR(10),
  "disposition" VARCHAR(20),
  "seconds" SMALLINT,
  "campaign_phoneNumber" INTEGER REFERENCES "campaign" (phoneNumber) on delete cascade
)