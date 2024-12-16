FROM node:16 as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:16

WORKDIR /app

COPY --from=build /app/build /app/build
COPY package*.json ./

RUN npm install --production

EXPOSE 3000

CMD ["npm", "run", "start"]