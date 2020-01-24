FROM node:10

ADD . .
LABEL Description="backendmodrp"
RUN yarn install
CMD npx sequelize-cli db:migrate && npx sequelize-cli db:seed:all && yarn start
EXPOSE 5312