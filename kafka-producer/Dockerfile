FROM node:18-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src/ ./src/

# Expose the metrics port
EXPOSE 9102

# Command to run the application
CMD ["node", "src/producer.js"] 