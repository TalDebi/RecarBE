FROM node:latest
WORKDIR ./app
COPY . .
RUN npm i
RUN npm run build
ENTRYPOINT ["node", "./dist/src/server.js"]
