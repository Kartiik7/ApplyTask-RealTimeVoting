const Poll = require('../models/Poll');
const VoteTracking = require('../models/VoteTracking');
const pollEvents = require('../../../shared/infra/events/pollEvents');
const crypto = require('crypto');
const mongoose = require('mongoose');
const AppError = require('../../../shared/utils/AppError');

class PollService {
  async createNewPoll(question, pollOptions) {
    if (!question || !pollOptions || pollOptions.length < 2) {
      throw new AppError('Question and at least 2 options are required', 400);
    }

    const sanitizedOptions = pollOptions
      .map(optionText => optionText.trim())
      .filter(optionText => optionText.length > 0);
    
    const distinctOptions = [...new Set(sanitizedOptions)];

    if (distinctOptions.length < 2) {
      throw new AppError('At least 2 unique non-empty options are required', 400);
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
      throw new AppError('Poll not found', 404);
    }
    return fetchedPoll;
  }

  async submitVote(pollId, optionIndex, voteToken, ipAddress, userAgent) {
    if (!voteToken || typeof voteToken !== 'string' || voteToken.trim().length === 0) {
      throw new AppError('Valid vote token is required', 400);
    }

    const hashedVoteToken = crypto.createHash('sha256').update(voteToken.trim()).digest('hex');
    
    const deviceHash = crypto
      .createHash('sha256')
      .update(ipAddress + (userAgent || '') + pollId)
      .digest('hex');

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const existingRecentVote = await VoteTracking.findOne({
      pollId,
      deviceHash,
      votedAt: { $gt: fiveMinutesAgo }
    });

    if (existingRecentVote) {
       throw new AppError('You can vote again on this poll after 5 minutes.', 403);
    }

    const session = await mongoose.startSession();
    let pollWithNewVote;

    try {
      await session.withTransaction(async () => {
        const targetPoll = await Poll.findById(pollId).session(session);
        if (!targetPoll) {
          throw new AppError('Poll not found', 404);
        }

        if (optionIndex < 0 || optionIndex >= targetPoll.options.length) {
          throw new AppError('Invalid option', 400);
        }

        try {
          // Track vote by Token AND IP AND DeviceHash
          await VoteTracking.create([{ 
              pollId, 
              tokenHash: hashedVoteToken,
              ipAddress: ipAddress,
              deviceHash: deviceHash
          }], { session });

        } catch (voteTrackingError) {
          console.log('[VoteTracking Error]', voteTrackingError.code, voteTrackingError.message);
          if (voteTrackingError.code === 11000) {
            // Check which index caused the violation if possible, otherwise generic message
            throw new AppError('You have already voted in this poll (Duplicate IP or Token)', 403);
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
          { returnDocument: 'after', session }
        );
      });
    } catch (error) {
       // If the error is one we threw inside the transaction, rethrow it
       if (error instanceof AppError) throw error;
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
