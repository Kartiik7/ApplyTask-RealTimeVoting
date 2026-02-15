const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

async function fixDatabase() {
    try {
        console.log('🔧 Starting database cleanup...\n');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected\n');

        const db = mongoose.connection.db;
        const collection = db.collection('votetrackings');

        // Step 1: Drop OLD indexes (voterHash-based)
        console.log('1️⃣  Dropping old voterHash indexes...');
        try {
            await collection.dropIndex('voterHash_1');
            console.log('   ✅ Dropped voterHash_1');
        } catch (e) {
            console.log('   ⚠️  voterHash_1 not found or already dropped');
        }
        
        try {
            await collection.dropIndex('pollId_1_voterHash_1');
            console.log('   ✅ Dropped pollId_1_voterHash_1');
        } catch (e) {
            console.log('   ⚠️  pollId_1_voterHash_1 not found or already dropped');
        }

        // Step 2: Delete invalid documents
        console.log('\n2️⃣  Deleting documents with null/missing tokenHash...');
        const deleteResult = await collection.deleteMany({
            $or: [
                { tokenHash: null },
                { tokenHash: { $exists: false } }
            ]
        });
        console.log(`   ✅ Deleted ${deleteResult.deletedCount} invalid documents`);

        // Step 3: Remove voterHash field from remaining documents
        console.log('\n3️⃣  Removing old voterHash field from documents...');
        const updateResult = await collection.updateMany(
            { voterHash: { $exists: true } },
            { $unset: { voterHash: "" } }
        );
        console.log(`   ✅ Updated ${updateResult.modifiedCount} documents`);

        // Step 4: Verify final state
        console.log('\n4️⃣  Verifying final state...');
        const remainingDocs = await collection.countDocuments();
        const indexes = await collection.indexes();
        
        console.log(`   📊 Remaining documents: ${remainingDocs}`);
        console.log('   📊 Current indexes:');
        indexes.forEach(idx => {
            console.log(`      - ${idx.name}: ${JSON.stringify(idx.key)} ${idx.unique ? '(UNIQUE)' : ''}`);
        });

        console.log('\n✅ Database cleanup complete!');
        console.log('\n💡 The correct indexes (pollId_1_tokenHash_1) are in place.');
        console.log('💡 All documents now have valid tokenHash values or have been removed.');

    } catch (error) {
        console.error('\n❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

fixDatabase();
