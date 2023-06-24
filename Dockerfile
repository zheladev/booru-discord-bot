FROM node:16.20-alpine3.17 AS base

RUN apk add --no-cache libc6-compat

WORKDIR /opt/danbooru-discord-bot

COPY . .
RUN npm ci
RUN yarn build