const express = require('express');
const { MongoClient } = require('mongodb');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// MongoDB configuration
const mongoUrl = process.env.MONGODB_URI || 'mongodb://mongodb:27017/events';
const dbName = mongoUrl.split('/').pop() || 'events';
const collectionName = process.env.MONGODB_COLLECTION || 'events';

// MongoDB client
let mongoClient;
let collection;

// Custom JSON logger for Morgan
morgan.token('request-body', (req) => JSON.stringify(req.body));
app.use(morgan((tokens, req, res) => {
  return JSON.stringify({
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: tokens.status(req, res),
    headers: req.headers,
    responseTime: `${tokens['response-time'](req, res)} ms`
  });
}));

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

// Events endpoint with filtering and pagination
app.get('/api/events', async (req, res) => {
  try {
    const {
      eventType,
      startTimestamp,
      endTimestamp,
      page = 1,
      limit = 10
    } = req.query;

    // Build query filter
    const filter = {};
    
    if (eventType) {
      filter.eventType = eventType;
    }
    
    if (startTimestamp || endTimestamp) {
      filter.timestamp = {};
      if (startTimestamp) {
        filter.timestamp.$gte = startTimestamp;
      }
      if (endTimestamp) {
        filter.timestamp.$lte = endTimestamp;
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get total count for pagination
    const totalCount = await collection.countDocuments(filter);
    
    // Fetch events with pagination
    const events = await collection
      .find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    
    res.json({
      data: events,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: parseInt(page) < totalPages,
        hasPreviousPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function startServer() {
  await connectToMongo();
  
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

// Handle graceful shutdown
const shutdown = async () => {
  try {
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

// Start the application
startServer(); 