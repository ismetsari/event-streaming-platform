FROM node:18-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src/ ./src/

# Expose the port
EXPOSE 3000

# Command to run the application
CMD ["node", "src/app.js"] 