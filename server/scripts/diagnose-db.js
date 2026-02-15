const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

async function diagnose() {
    try {
        console.log('Connecting to:', MONGO_URI.replace(/:[^:@]+@/, ':****@'));
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected\n');

        const db = mongoose.connection.db;

        // List all collections
        console.log('📋 Collections in database:');
        const collections = await db.listCollections().toArray();
        for (const coll of collections) {
            console.log(`  - ${coll.name}`);
        }

        // Check votetrackings specifically
        if (collections.some(c => c.name === 'votetrackings')) {
            console.log('\n🔍 VoteTracking collection details:');
            const vtCollection = db.collection('votetrackings');
            
            // Get indexes
            const indexes = await vtCollection.indexes();
            console.log('\n  Indexes:');
            for (const idx of indexes) {
                console.log(`    - ${idx.name}: ${JSON.stringify(idx.key)} ${idx.unique ? '(UNIQUE)' : ''}`);
            }
            
            // Count documents
            const count = await vtCollection.countDocuments();
            console.log(`\n  Total documents: ${count}`);
            
            // Sample a few documents
            if (count > 0) {
                const samples = await vtCollection.find().limit(3).toArray();
                console.log('\n  Sample documents:');
                samples.forEach((doc, i) => {
                    console.log(`    ${i + 1}. ${JSON.stringify(doc, null, 2)}`);
                });
            }
            
            // Check for documents with null voterHash
            const nullVoterHash = await vtCollection.countDocuments({ voterHash: null });
            const nullTokenHash = await vtCollection.countDocuments({ tokenHash: null });
            const missingTokenHash = await vtCollection.countDocuments({ tokenHash: { $exists: false } });
            
            console.log(`\n  Documents with voterHash=null: ${nullVoterHash}`);
            console.log(`  Documents with tokenHash=null: ${nullTokenHash}`);
            console.log(`  Documents missing tokenHash field: ${missingTokenHash}`);
        } else {
            console.log('\n ℹ️  VoteTracking collection does not exist yet');
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

diagnose();
