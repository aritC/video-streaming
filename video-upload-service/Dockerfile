# pull official base image
FROM node:alpine

# set work directory
WORKDIR /usr/src/app

# copy package.json and yarn.lock
COPY package*.json ./

# install dependencies
RUN npm install

# copy project
COPY . .

# set build-time args
ARG DEFAULT_PORT=4000

# set port as env
ENV PORT=$DEFAULT_PORT

# expose server port
EXPOSE $PORT

ENTRYPOINT ['node','index.js']