# Event Streaming Platform

This project consists of three main services that work together to handle event streaming:

## Project Structure

```
event-streaming-platform/
├── charts
├── kafka-producer/     # Produces events to Kafka topics
├── kafka-consumer/     # Consumes events from Kafka topics
├── event-api/         # API service for handling events
├── templates/         # Shared code and configurations
├── docker-compose.yml # Local development setup
├── Chart.yaml         # Shared code and configurations
└── values.yaml        # Shared code and configurations
```

## Services

- **Kafka Producer**: Responsible for producing events to Kafka topics
- **Kafka Consumer**: Processes events from Kafka topics
- **Event API**: Provides REST API endpoints for event handling

## Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- Helm
- Kubernetes

## Getting Started

1. Clone the repository
   ```
   gh repo clone ismetsari/event-streaming-platform
   ```
2. Navigate to the project directory:
   ```
   cd event-streaming-platform
   ```
3. Start all services using Helm:
   ```
   helm install event-streaming-platform .
   ```
   ## Challanges Faced 

   1. I have no experience with Node.js, which has contributed to challenges in the project. The code occasionally exits, causing the pod to restart automatically, and my current Node.js knowledge isn't sufficient to fully resolve this issue.
   2. I had no prior experience with Kafka, so I had to learn it from scratch. I watched instructional videos on YouTube and thoroughly reviewed the documentation to build my understanding. AI tools helped me to fix this issue.

   ## Scalability

   1. Kafka is highly scalable, allowing seamless horizontal scaling by adding more brokers to a cluster to handle increased data and traffic. 
   2. Kubernetes-native scaling capabilities.

   ## Fault Tolerance

   1. The platform uses Apache Kafka as the core messaging system, which inherently provides fault tolerance through data replication.
   2. Managing numerous services can be overwhelming.
   3. MongoDB is used for data storage with persistence.
   4. Number of replicas can be increased to improve fault tolerance.

   ## Security

   1. External access to Kafka is disabled.
   2. Resource limits are set for services to prevent DoS attacks.
   3. Kafka is using PLAINTEXT protocol without encryption this is a security risk.
   4. MongoDB authentication is disabled this is a security risk.