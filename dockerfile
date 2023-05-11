FROM node:16-alpine AS base
WORKDIR /usr/src/app
RUN touch /usr/src/app/.env
COPY package.json yarn.lock tsconfig.json ./

FROM base as development
ENV NODE_ENV=development
RUN yarn install

FROM base as build
RUN yarn build

FROM build AS production
ENV NODE_ENV=production
COPY --from=build /usr/src/app/dist /usr/src/app/dist
COPY .env.production ./
RUN yarn install --prod
RUN yarn add -g pm2
