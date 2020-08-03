# Call Tracker for Voip.ms - Backend

This repo is the API for the front end repo of the same name. It will handle data requests to the Voip.ms service, and logging user, did and campaign information to the database.


### Setup

1. Create a `.env` file in the project root. 

2. Setup a database for Postgres version 10 or higher. 

3. Setup your Voip.ms account if you don't already have one. 

4. Enter key value pairs in the `.env` file for the following keys:

```
POSTGRES_HOST
POSTGRES_DATABASE
POSTGRES_PORT
POSTGRES_USER
POSTGRES_PASSWORD

VOIPMS_USER
VOIPMS_PASSWORD
```

4. Install `aws-cli` and `aws-cdk`. Configure `aws-cli` with your account details

5. Run the following commands to setup the Api in your account

```
cdk bootstrap && cdk synth && cdk deploy
```

6. The terminal output should include a URL to the Api. Use this as your `API_ROOT_URL` value in the front end repo.

