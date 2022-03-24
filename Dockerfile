FROM node:gallium-alpine3.15 as build
COPY . /tmp/build
COPY package.json /tmp/build
COPY yarn.lock /tmp/build
RUN apk add --no-cache python3 ffmpeg
RUN ln -s /usr/bin/python3 /usr/bin/python
WORKDIR /tmp/build
RUN yarn install
RUN yarn tsc

FROM node:gallium-alpine3.15 as deploy
COPY --from=build /tmp/build/dist /app/dist
COPY .env /app/
COPY package.json /app/
COPY yarn.lock /app/
WORKDIR /app
RUN apk add --no-cache python3 ffmpeg
RUN ln -s /usr/bin/python3 /usr/bin/python
RUN yarn install
ENTRYPOINT ["npm", "start"]
