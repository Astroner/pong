FROM node:16.20-alpine

WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm ci

COPY index.js .
COPY index.min.html .

ENV PORT=80
EXPOSE 80

CMD ["node", "index.js"]