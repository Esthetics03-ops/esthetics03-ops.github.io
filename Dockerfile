# 1. Start with a small, secure version of Node.js
FROM node:18-slim

# 2. Create a folder inside the container for your code
WORKDIR /usr/src/app

# 3. Copy your package files first (helps make builds faster)
COPY package*.json ./

# 4. Install only the necessary tools
RUN npm install --production

# 5. Copy the rest of your server code
COPY . .

# 6. Tell the container which port to listen on (Google Cloud defaults to 8080)
EXPOSE 8080

# 7. The command to start your API
CMD [ "node", "server.js" ]
