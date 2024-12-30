const { Kafka } = require('kafkajs');
const { MongoClient } = require('mongodb');
require('dotenv').config();

// Kafka configuration
const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'event-consumer',
  brokers: (process.env.KAFKA_BOOTSTRAP_SERVERS || 'kafka:29092').split(','),
  ssl: process.env.KAFKA_SSL === 'true',
  sasl: process.env.KAFKA_SASL === 'true' ? {
    mechanism: process.env.KAFKA_SASL_MECHANISM,
    username: process.env.KAFKA_SASL_USERNAME,
    password: process.env.KAFKA_SASL_PASSWORD,
  } : undefined,
});

// MongoDB configuration
const mongoUrl = process.env.MONGODB_URI || 'mongodb://mongodb:27017/events';
const dbName = mongoUrl.split('/').pop() || 'events';
const collectionName = process.env.MONGODB_COLLECTION || 'events';

// Kafka consumer configuration
const consumer = kafka.consumer({
  groupId: process.env.KAFKA_GROUP_ID || 'event-consumer-group'
});

const topic = process.env.KAFKA_TOPIC || 'random-events';

// MongoDB client
let mongoClient;
let collection;

// Connect to MongoDB
async function connectToMongo() {
  try {
    mongoClient = new MongoClient(mongoUrl);
    await mongoClient.connect();
    console.log('Connected to MongoDB');
    
    const db = mongoClient.db(dbName);
    collection = db.collection(collectionName);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Main function to consume events
async function consumeEvents() {
  try {
    // Connect to both Kafka and MongoDB
    await connectToMongo();
    await consumer.connect();
    console.log('Connected to Kafka');

    // Subscribe to the topic
    await consumer.subscribe({
      topic,
      fromBeginning: process.env.KAFKA_READ_FROM_BEGINNING === 'true'
    });

    // Start consuming messages
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const event = JSON.parse(message.value.toString());
          console.log('Received event:', JSON.stringify(event, null, 2));

          // Add metadata about when the event was consumed
          const eventWithMetadata = {
            ...event,
            metadata: {
              consumedAt: new Date().toISOString(),
              topic,
              partition
            }
          };

          // Store in MongoDB
          await collection.insertOne(eventWithMetadata);
          console.log('Stored event in MongoDB with ID:', eventWithMetadata._id);
        } catch (error) {
          console.error('Error processing message:', error);
        }
      },
    });
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
const shutdown = async () => {
  try {
    await consumer.disconnect();
    console.log('Disconnected from Kafka');
    
    if (mongoClient) {
      await mongoClient.close();
      console.log('Disconnected from MongoDB');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start the consumer
consumeEvents(); 