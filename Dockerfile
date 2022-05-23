FROM node:16-alpine
# Install Dependencies
RUN apk add python3 --no-cache
# Link Dependencies
RUN ln -s /usr/bin/python3 /usr/bin/python
# Copy
RUN mkdir /app
COPY package.json /app
COPY tsconfig.json /app
COPY yarn.lock /app
COPY src /app/src
COPY prisma/schema.prisma /app
WORKDIR /app

# Build
RUN yarn
RUN yarn build

# Cleanup
RUN rm -rf /src
RUN rm -rf tsconfig.json
RUN rm -rf yarn.lock

CMD [ "node", "/app/dist/main.js" ]