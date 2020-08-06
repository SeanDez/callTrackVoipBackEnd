-- local command
-- psql -h localhost -U "{username}" -d "{dataBase}" -a -f {fullFilePath}

-- remote command
-- psql -h {host} -U "{username}" -d "{dataBase}" -a -f {fullFilePath}

CREATE TABLE IF NOT EXISTS "app_user" (
  "id" SERIAL primary key,
  "user_name" VARCHAR(50) unique not null
);

CREATE TABLE IF NOT EXISTS "campaign" (
  "id" SERIAL primary key,
  "name" VARCHAR(100),
  "status" VARCHAR(30),
  "number_id" INTEGER
);

CREATE TABLE IF NOT EXISTS "number" (
  "id" SERIAL primary key,
  "number" VARCHAR(11) not null,
  "app_user_id" INTEGER REFERENCES "app_user" (id) on delete cascade
);

-- needed because table "number" can't be referenced at the time table "campaign" is created
ALTER TABLE "campaign"
ADD CONSTRAINT "fk_campaign_number"
FOREIGN KEY (number_id) REFERENCES "number" (id) on delete cascade;
