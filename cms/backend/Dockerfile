FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN mkdir -p uploads logs

EXPOSE 5000
CMD ["node", "server.js"]
