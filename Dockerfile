FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Install build tools for bcrypt
RUN apk add --no-cache make g++ python3

RUN npm install

# Rebuild bcrypt to match the container's architecture
RUN npm rebuild bcrypt --build-from-source

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
