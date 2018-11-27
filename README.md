# RC Assistant

## Dev setup

```
yarn install
cp .sample.env .env
edit .env
yarn ngork
yarn dev
HTTP PUT https://<ngork-server>/admin/setup-database
```


## Deploy to AWS Lambda

```
cp .sample.env.yml .env.yml
edit .env.yml
yarn deploy
HTTP PUT https://<lambda-server>/prod/admin/setup-database
```


## Check remote logs

```
sls logs -f app/proxy/crontab/maintain
```


## Add coloums to tables:

Most developers don't need this.
If you do need to change database schema:

```
npx sequelize init
npx sequelize migration:create add-timestamps
npx squelize db:migrate
```
