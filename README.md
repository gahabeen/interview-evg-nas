# Apify backend challenge

MongoDB is our main database where we store the metadata about our users and their jobs. Each item in MongoDB has a couple of counters (integers). For example for user object contains:

- `user.numberOfRuns`
- `user.numberOfEvents`
- `user.numberOfItemsScraped`

These counters are updated thousands of times per second which could easily overload the MongoDB. Therefore we need to buffer these updates using in-memory cache (Redis) and update the MongoDB database just once every few seconds with accumulated value.

The goal of this task is to implement class `BufferedMongoIncrements` that will buffer these increments in the Redis and on a given period update them in the MongoDB:

```js
const userBufferedIncrements = new BufferedMongoIncrements(
    mongodbClient.collection('users'),
    redisClient,
	5 * 60 * 1000, // 5 minutes
});

// ID of some user
const USER_ID = 'xxldnieojRj33DDijp';

// These updates are being buffered in the Redis and after 5 minutes the 
// BufferedMongoIncrements class will update them in the DB.
await userBufferedIncrements.increment(USER_ID, 'numberOfRuns', 100);
await userBufferedIncrements.increment(USER_ID, 'numberOfRuns', 5);
await userBufferedIncrements.increment(USER_ID, 'numberOfRuns', 20);

// Class should support negative numbers
await userBufferedIncrements.increment(USER_ID, 'someOtherField', -2);

```

## Task

- Implement `BufferedMongoIncrements` class in the `./src/bufferedMongoIncrements.ts` according to the description ⬆️
- Class must pass a test stored in the `./test/bufferedMongoIncrements.test.ts`
- Project contains a Docker Compose configuration of MongoDB and Redis you need for the task
- How to use it:
    1. run `npm i` to install required dependencies
    2. start Docker
    3. run `docker compose up` to spin up the MongoDB and Redis instance
    4. write your solution 👨‍💻
    5. run `npm run test` to validate the solution
