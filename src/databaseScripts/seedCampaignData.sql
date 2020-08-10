-- local command
-- psql -h localhost -U "{username}" -d "{dataBase}" -a -f {fullFilePath}

-- remote command
-- psql -h {host} -U "{username}" -d "{dataBase}" -a -f {fullFilePath}

INSERT INTO "campaign" (name, status, number, app_user_id) VALUES
('campaign01', 'active', '01234567890', 2), 
(null, 'archived', '460482p5479', 1), 
('campaign03', 'inactive', '17027741094', 2), 
('campaign04', 'active', '91465657932', 1), 
(null, null, '66986267061', 2), 
('campaign06', 'inactive', '88222119025', 1), 
(null, null, '59450020589', 2), 
('campaign08', 'archived', '18078275191', 1), 
('campaign09', 'inactive', '97972202532', 1), 
('campaign010', null, '23710041749', 1), 
('campaign11', null, '87298163647', 2), 
('campaign12', 'inactive', '42457843647', 1), 
('campaign013', 'active', '56523849483', 1), 
('campaign14', 'archived', '37732243325', 1), 
('campaign15', 'inactive', '93418635266', 1);