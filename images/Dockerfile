FROM node:lts
WORKDIR /usr/app
COPY package.json .
COPY app.js .
COPY auth-middleware ./auth-middleware
COPY .env .env
RUN npm install --quiet

EXPOSE 4006

CMD ["npm", "start"]