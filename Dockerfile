FROM node:alpine

RUN mkdir /app
WORKDIR /app

COPY package.json .
COPY index.js .
RUN npm install

CMD [ "node", "index.js" ]