FROM node:20 as builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci 

COPY . . 
RUN npx prisma generate
RUN npm run build

FROM node:alpine3.16

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --production

COPY . . 
RUN npx prisma generate

COPY --from=builder /usr/src/app/build .  

EXPOSE 3000

CMD ["node", "./server.js"]