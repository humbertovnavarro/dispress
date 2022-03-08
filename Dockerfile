FROM node:gallium-alpine3.15 as build
COPY . /tmp/build
COPY package.json /tmp/build
COPY yarn.lock /tmp/build
RUN npm install -g yarn
RUN apk add --no-cache python3 ffmpeg
RUN ln -s /usr/bin/python3 /usr/bin/python
RUN yarn install
RUN yarn build

FROM node:gallium-alpine3.15 as deploy
COPY --from=stage /tmp/build/dist /app/dist
COPY .env /app/
COPY package.json /app/
COPY yarn.lock /app/
WORKDIR /app
RUN apk add --no-cache python3 ffmpeg
RUN ln -s /usr/bin/python3 /usr/bin/python
RUN npm install -g yarn
RUN yarn install
ENTRYPOINT ["npm", "start"]
