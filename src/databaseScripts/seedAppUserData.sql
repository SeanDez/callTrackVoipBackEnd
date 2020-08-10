-- local command
-- psql -h localhost -U "{username}" -d "{dataBase}" -a -f {fullFilePath}

-- remote command
-- psql -h {host} -U "{username}" -d "{dataBase}" -a -f {fullFilePath}


INSERT INTO "app_user" (user_name, password_hash) VALUES 
('abe@gmail.com', 'fakehash1'), ('ben@yahoo.com', 'fakehash2');