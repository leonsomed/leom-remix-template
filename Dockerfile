FROM node:20-alpine as base

FROM base as builder
WORKDIR /usr/server/app

COPY . .
RUN npm install
RUN npm run build

FROM base as release
WORKDIR /usr/server/app

COPY --from=builder /usr/server/app/package.json ./package.json
COPY --from=builder /usr/server/app/node_modules ./node_modules
COPY --from=builder /usr/server/app/dist ./dist
COPY --from=builder /usr/server/app/public ./public
RUN npm prune --production

ENV NODE_ENV production
CMD ["npm", "run", "start"]