import type { Collection } from 'mongodb';
import type { Redis } from 'ioredis';


export class BufferedMongoIncrements {
    constructor(collection: Collection, redis: Redis, flushIntervalMillis: number) {
        // TODO implement
    }

    async increment(documentId: string, fieldPath: string, increment: number): Promise<void> {
        // TODO implement
    }

    destroy() {
        // TODO implement
    }
}
