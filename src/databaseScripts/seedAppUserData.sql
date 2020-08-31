-- local command
-- psql -h localhost -U username -d database -a -f fullFilePath

-- remote command
-- psql -h host -U username -d database -a -f fullFilePath


INSERT INTO "app_user" (user_name, password_hash, voipms_user_email, voipms_password_encrypted) VALUES 
('abe@gmail.com', 'fakehash1', 'abeVoipEmail', 'abeEncryptedPass'), 
('ben@yahoo.com', 'fakehash2', 'benVoipEmail', 'benencryptedPass'),

ON CONFLICT DO NOTHING;