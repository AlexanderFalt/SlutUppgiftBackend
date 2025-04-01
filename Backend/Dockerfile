FROM node:18-alpine

WORKDIR /app

# Install Python, make, and g++ (build tools) for node-gyp to work
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install --build-from-source

COPY . .

EXPOSE 8080
CMD ["npm", "start"]