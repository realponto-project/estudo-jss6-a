FROM node:10

ADD . .
LABEL Description="backendmodrp"
RUN yarn install
CMD [ "yarn", "start" ]
EXPOSE 5200