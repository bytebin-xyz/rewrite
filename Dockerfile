FROM node:14.2-alpine as development

WORKDIR /home/bytebin/services/web

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --production=false

COPY . .

RUN yarn build

FROM node:14.2-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /home/bytebin/services/web

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --production=true

COPY . .

COPY --from=development /home/bytebin/services/web/dist ./dist

CMD ["node", "dist/server/main"]