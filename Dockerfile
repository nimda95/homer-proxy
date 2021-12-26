FROM node:alpine

RUN mkdir /app
WORKDIR /app

COPY node_modules .
COPY index.js .

EXPOSE ${PORT}

CMD [ "node", "index.js" ]