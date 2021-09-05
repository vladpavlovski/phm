FROM node:12.22-buster-slim

RUN mkdir -p /app
WORKDIR /app

COPY package.json .
RUN npm install
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
