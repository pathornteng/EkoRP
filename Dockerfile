FROM node:6
COPY . /app
WORKDIR /app
touch .env
CMD npm install
