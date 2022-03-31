FROM node:gallium-alpine3.15
RUN npm install pm2 -g &&\
apk add --no-cache ffmpeg python3 &&\
ln -s /usr/bin/python3 /usr/bin/python
WORKDIR /app
COPY . .
RUN yarn install &&\
    yarn cache clean &&\
    yarn build
CMD ["pm2-runtime","-n dispress", "./dist/main.js"]
