# Event Streaming Platform

This project consists of three main services that work together to handle event streaming:

## Project Structure

```
event-streaming-platform/
├── kafka-producer/     # Produces events to Kafka topics
├── kafka-consumer/     # Consumes events from Kafka topics
├── event-api/         # API service for handling events
├── shared/           # Shared code and configurations
└── docker-compose.yml # Local development setup
```

## Services

- **Kafka Producer**: Responsible for producing events to Kafka topics
- **Kafka Consumer**: Processes events from Kafka topics
- **Event API**: Provides REST API endpoints for event handling

## Prerequisites

- Docker and Docker Compose
- Node.js (for local development)

## Getting Started

1. Clone the repository
2. Navigate to the project directory:
   ```bash
   cd event-streaming-platform
   ```
3. Start all services using Docker Compose:
   ```bash
   docker-compose up
   ```

## Development

Each service can be developed independently in its own directory. For local development without Docker:

1. Navigate to the service directory
2. Install dependencies
3. Follow the service-specific README for development instructions

## Environment Variables

Each service has its own environment variables defined in the docker-compose.yml file. For local development, create a `.env` file in each service directory. 