const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/applyo';

async function fixVoteTracking() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('votetrackings');

        // Step 1: Check if collection exists
        console.log('\n🔧 Checking if collection exists...');
        const collections = await db.listCollections({ name: 'votetrackings' }).toArray();
        
        if (collections.length === 0) {
            console.log('ℹ️  Collection does not exist yet - this is fine!');
            console.log('✅ The correct schema will create proper indexes on first use.');
            return;
        }

        // Step 2: Drop old indexes with voterHash
        console.log('\n🔧 Checking existing indexes...');
        const indexes = await collection.indexes();
        console.log('Current indexes:', JSON.stringify(indexes, null, 2));

        for (const index of indexes) {
            if (index.key.voterHash !== undefined) {
                console.log(`\n🗑️  Dropping old index: ${index.name}`);
                await collection.dropIndex(index.name);
                console.log('✅ Dropped successfully');
            }
        }

        // Step 2: Delete documents with null voterHash or tokenHash
        console.log('\n🧹 Cleaning up invalid documents...');
        const deleteResult = await collection.deleteMany({
            $or: [
                { voterHash: null },
                { voterHash: { $exists: true } },
                { tokenHash: null },
                { tokenHash: { $exists: false } }
            ]
        });
        console.log(`✅ Deleted ${deleteResult.deletedCount} invalid documents`);

        // Step 4: Ensure correct index exists
        console.log('\n🔨 Creating correct index...');
        await collection.createIndex(
            { pollId: 1, tokenHash: 1 },
            { unique: true }
        );
        console.log('✅ Created unique index on { pollId, tokenHash }');

        // Step 5: Verify final state
        console.log('\n📊 Final state:');
        const finalIndexes = await collection.indexes();
        console.log('Indexes:', JSON.stringify(finalIndexes, null, 2));
        
        const docCount = await collection.countDocuments();
        console.log(`Total documents: ${docCount}`);

        console.log('\n✅ Migration complete!');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n👋 Disconnected from MongoDB');
        process.exit(0);
    }
}

fixVoteTracking();
