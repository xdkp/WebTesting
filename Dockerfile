FROM node:20.11.0
WORKDIR /usr/src/app
RUN npm install -g nodemon
COPY package*.json ./
RUN npm install
COPY . .
COPY ./scripts/wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh
EXPOSE 3000
CMD ["nodemon", "src/server.js"]
