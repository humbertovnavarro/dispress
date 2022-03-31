FROM node:gallium-alpine3.15
RUN npm install pm2 -g
RUN apk add --no-cache ffmpeg python3
RUN ln -s /usr/bin/python3 /usr/bin/python
WORKDIR /app
COPY . .
RUN yarn install
RUN yarn build
CMD ["pm2-runtime","-n dispress", "./dist/main.js"]
