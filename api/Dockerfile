FROM node:erbium-buster-slim

RUN mkdir -p /app
WORKDIR /app

COPY package.json .
RUN npm install
COPY . .

EXPOSE 4001

CMD ["npm", "start"]
