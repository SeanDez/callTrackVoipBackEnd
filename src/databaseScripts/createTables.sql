-- local command
-- psql -h localhost -U "{username}" -d "{dataBase}" -a -f {fullFilePath}

-- remote command
-- psql -h {host} -U "{username}" -d "{dataBase}" -a -f {fullFilePath}

CREATE TABLE IF NOT EXISTS "app_user" (
  "id" SERIAL primary key,
  "user_name" VARCHAR(50) unique not null,
  "password_hash" VARCHAR(50) not null
);

CREATE TABLE IF NOT EXISTS "campaign" (
  "id" SERIAL primary key,
  "name" VARCHAR(100),
  "status" VARCHAR(30),
  "number" VARCHAR(11) not null,
  "app_user_id" INTEGER REFERENCES "app_user" (id) on delete cascade
);