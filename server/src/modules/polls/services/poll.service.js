const Poll = require('../models/Poll');
const VoteTracking = require('../models/VoteTracking');
const pollEvents = require('../../../shared/infra/events/pollEvents');
const crypto = require('crypto');
const mongoose = require('mongoose');

class PollService {
  async createNewPoll(question, pollOptions) {
    if (!question || !pollOptions || pollOptions.length < 2) {
      throw { status: 400, message: 'Question and at least 2 options are required' };
    }

    const sanitizedOptions = pollOptions
      .map(optionText => optionText.trim())
      .filter(optionText => optionText.length > 0);
    
    const distinctOptions = [...new Set(sanitizedOptions)];

    if (distinctOptions.length < 2) {
      throw { status: 400, message: 'At least 2 unique non-empty options are required' };
    }

    const pollOptionsWithVotes = distinctOptions.map(optionText => ({ text: optionText, votes: 0 }));

    return await Poll.create({
      question: question.trim(),
      options: pollOptionsWithVotes
    });
  }

  async getPollById(pollId) {
    const fetchedPoll = await Poll.findById(pollId);
    if (!fetchedPoll) {
      throw { status: 404, message: 'Poll not found' };
    }
    return fetchedPoll;
  }

  async submitVote(pollId, optionIndex, voteToken, ipAddress) {
    if (!voteToken || typeof voteToken !== 'string' || voteToken.trim().length === 0) {
      throw { status: 400, message: 'Valid vote token is required' };
    }

    const hashedVoteToken = crypto.createHash('sha256').update(voteToken.trim()).digest('hex');

    const session = await mongoose.startSession();
    let pollWithNewVote;

    try {
      await session.withTransaction(async () => {
        const targetPoll = await Poll.findById(pollId).session(session);
        if (!targetPoll) {
          throw { status: 404, message: 'Poll not found' };
        }

        if (optionIndex < 0 || optionIndex >= targetPoll.options.length) {
          throw { status: 400, message: 'Invalid option' };
        }

        try {
          // Track vote by Token AND IP
          await VoteTracking.create([{ 
              pollId, 
              tokenHash: hashedVoteToken,
              ipAddress: ipAddress 
          }], { session });

        } catch (voteTrackingError) {
          console.log('[VoteTracking Error]', voteTrackingError.code, voteTrackingError.message);
          if (voteTrackingError.code === 11000) {
            // Check which index caused the violation if possible, otherwise generic message
            throw { status: 403, message: 'You have already voted in this poll (Duplicate IP or Token)' };
          }
          throw voteTrackingError;
        }

        pollWithNewVote = await Poll.findByIdAndUpdate(
          pollId,
          { 
            $inc: { 
              [`options.${optionIndex}.votes`]: 1, 
              totalVotes: 1 
            } 
          },
          { new: true, session }
        );
      });
    } catch (error) {
       // If the error is one we threw inside the transaction, rethrow it
       if (error.status) throw error;
       // Otherwise it's a DB/System error
       throw error;
    } finally {
      await session.endSession();
    }

    // Emit event instead of direct socket call
    pollEvents.emit('voteUpdated', pollWithNewVote);

    return pollWithNewVote;
  }
}

module.exports = new PollService();
