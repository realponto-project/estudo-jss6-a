FROM node:10

ADD . .
LABEL Description="backendmodrp"
RUN yarn install
RUN ln -sf /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime
CMD ["yarn", "start"]
EXPOSE 5312