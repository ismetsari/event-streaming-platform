FROM node:18-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Expose health check port
EXPOSE 9102

# Copy source code
COPY src/ ./src/

# Command to run the application
CMD ["node", "src/consumer.js"] 