const { Kafka } = require('kafkajs');
const { v4: uuidv4 } = require('uuid');
const express = require('express');
const client = require('prom-client'); // Prometheus client for metrics
require('dotenv').config();

//Set up Express for metrics endpoint
const app = express();
const port = process.env.METRICS_PORT || 9102; // Port for Prometheus scraping

// Create Prometheus registry and default metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Start Prometheus metrics server
const startMetricsServer = async () => {
  try {
    app.get('/metrics', async (req, res) => {
      res.set('Content-Type', register.contentType);
      res.end(await register.metrics());
    });

    app.listen(port, () => {
      console.log(`✅ Metrics server running at http://localhost:${port}/metrics`);
    });
  } catch (err) {
    console.error('❌ Error starting metrics server:', err);
  }
};

// Kafka configuration from environment variables
const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'random-event-producer',
  brokers: (process.env.KAFKA_BOOTSTRAP_SERVERS || 'kafka:29092').split(','),
  ssl: process.env.KAFKA_SSL === 'true',
  sasl: process.env.KAFKA_SASL === 'true' ? {
    mechanism: process.env.KAFKA_SASL_MECHANISM,
    username: process.env.KAFKA_SASL_USERNAME,
    password: process.env.KAFKA_SASL_PASSWORD,
  } : undefined,
});

const producer = kafka.producer();
const topic = process.env.KAFKA_TOPIC || 'random-events';

// Array of possible event types
const eventTypes = ['user_signup', 'order_created', 'payment_processed', 'item_shipped'];

// Function to generate random payload
function generateRandomPayload() {
  return {
    userId: Math.floor(Math.random() * 1000),
    amount: parseFloat((Math.random() * 1000).toFixed(2)),
    status: Math.random() > 0.5 ? 'success' : 'pending'
  };
}

// Function to generate event message
function generateEvent() {
  return {
    eventId: uuidv4(),
    eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
    timestamp: new Date().toISOString(),
    payload: generateRandomPayload()
  };
}

// Main function to publish events
async function publishEvents() {
  try {
    await producer.connect();
    console.log('Connected to Kafka');

    // Publish event every 3 seconds
    setInterval(async () => {
      const event = generateEvent();
      
      await producer.send({
        topic,
        messages: [
          {
            value: JSON.stringify(event)
          }
        ]
      });

      console.log('Published event:', JSON.stringify(event, null, 2));
    }, 3000);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
const shutdown = async () => {
  try {
    await producer.disconnect();
    console.log('Disconnected from Kafka');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start both the Kafka Producer and Metrics Server
startMetricsServer();
publishEvents(); 