FROM node:20

WORKDIR /usr/src/app

COPY . ./

RUN npm install

EXPOSE 8000

CMD [ "npm", "start" ]