import { MongoClient } from 'mongodb';
import Redis from 'ioredis';
import { delayPromise, cryptoRandomObjectId } from '@apify/utilities';

import { MONGODB_HOSTNAME, MONGODB_PORT, REDIS_HOSTNAME, REDIS_PORT } from '../src/config';
import { BufferedMongoIncrements } from '../src/bufferedMongoIncrements';

const MONGODB_URI = `mongodb://${MONGODB_HOSTNAME}:${MONGODB_PORT}`;

describe('BufferedMongoIncrements', () => {
    const randomCollectionName = `test-users-${cryptoRandomObjectId(5)}`;

    let mongoClient;
    let testedCollection = null;
    let redis = null

    beforeAll(async () => {
        mongoClient = await MongoClient.connect(MONGODB_URI);
        const db = mongoClient.db('test-database');
        testedCollection = db.collection(randomCollectionName);
        redis = new Redis(REDIS_PORT, REDIS_HOSTNAME);
    });
    afterAll(async () => {
        testedCollection = await testedCollection.drop();
        mongoClient.destroy();
        await redis.del('*');
        redis.disconnect();
    });

    it('works', async () => {
        // Initialize collection
        const user1Id = 'user-12345';
        const user2Id = 'user-54321';
        const user1Stats = {};
        const user2Stats = {
            totalCU: 111,
        };
        await testedCollection.updateOne({ _id: user1Id }, { $set: { stats: user1Stats } }, { upsert: true });
        await testedCollection.updateOne({ _id: user2Id }, { $set: { stats: user2Stats } }, { upsert: true });
        const flushIntervalMillis = 2 * 1000;

        // Use BufferedMongoIncrements
        const usersBufferedIncrements = new BufferedMongoIncrements(testedCollection, redis, flushIntervalMillis);
        const numberOperations = [0, 1, -10, 1.4, -2, 101, -19, 7, 5.5, 0.1111];
        for (let number of numberOperations) {
            await Promise.all([
                usersBufferedIncrements.increment(user1Id, 'stats.totalCU', number),
                usersBufferedIncrements.increment(user2Id, 'stats.totalCU', number),
            ]);
        }

        // Check that users are untouched
        let user1 = await testedCollection.findOne({ _id: user1Id });
        expect(user1.stats.totalCU).toBe(undefined);
        let user2 = await testedCollection.findOne({ _id: user2Id });
        expect(user2.stats.totalCU).toBe(user2Stats.totalCU);

        // Wait flushIntervalMillis and check that users got updated
        await delayPromise(flushIntervalMillis + 100);
        user1 = await testedCollection.findOne({ _id: user1Id });
        expect(user1.stats.totalCU).toBe(numberOperations.reduce((prev, cur) => prev + cur, 0));
        user2 = await testedCollection.findOne({ _id: user2Id });
        expect(user2.stats.totalCU).toBe(user2Stats.totalCU + numberOperations.reduce((prev, cur) => prev + cur, 0));

    });

    it('works if multiple instances call increment concurrently', async () => {
        // TODO: Write the test.
    });
});
