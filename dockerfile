FROM node:16-alpine AS base
WORKDIR /usr/src/app
RUN touch /usr/src/app/.env
COPY package.json yarn.lock tsconfig.json ./

FROM base as development
ENV NODE_ENV=development
RUN yarn install
