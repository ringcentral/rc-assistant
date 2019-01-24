# RC Assistant

## Dev setup

```
yarn install
cp .sample.env .env
edit .env
yarn ngork
yarn dev
curl -X PUT -u <admin>:<password> https://<chatbot-server>/admin/setup-database
```


## Deploy to AWS Lambda

```
cp .sample.env.yml .env.yml
edit .env.yml
yarn deploy
curl -X PUT -u <admin>:<password> https://<chatbot-server>/admin/setup-database
```


## Check remote logs

```
sls logs -f app/proxy/crontab/maintain
```


## Todo

- AWS Lex support synonyms?
    - information === info
- Write auto test
