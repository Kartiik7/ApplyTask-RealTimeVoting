const Poll = require('../models/Poll');
const VoteTracking = require('../models/VoteTracking');
const { getSocketIOInstance } = require('../../../shared/infra/socket/socket');
const crypto = require('crypto');

class PollService {
  /**
   * Creates a new poll with the given question and options.
   * @param {string} question - The poll question.
   * @param {string[]} pollOptions - Array of option strings.
   * @returns {Promise<Object>} The created poll document.
   */
  async createNewPoll(question, pollOptions) {
    if (!question || !pollOptions || pollOptions.length < 2) {
      throw { status: 400, message: 'Question and at least 2 options are required' };
    }

    // Remove empty options and whitespace
    const sanitizedOptions = pollOptions
      .map(optionText => optionText.trim())
      .filter(optionText => optionText.length > 0);
    
    // Ensure uniqueness
    const distinctOptions = [...new Set(sanitizedOptions)];

    if (distinctOptions.length < 2) {
      throw { status: 400, message: 'At least 2 unique non-empty options are required' };
    }

    // Format for database storage (add initial vote count)
    const pollOptionsWithVotes = distinctOptions.map(optionText => ({ text: optionText, votes: 0 }));

    return await Poll.create({
      question: question.trim(),
      options: pollOptionsWithVotes
    });
  }

  /**
   * Retrieves a poll by its ID.
   * @param {string} pollId - The ID of the poll to retrieve.
   * @returns {Promise<Object>} The poll document.
   */
  async getPollById(pollId) {
    const fetchedPoll = await Poll.findById(pollId);
    if (!fetchedPoll) {
      throw { status: 404, message: 'Poll not found' };
    }
    return fetchedPoll;
  }

  /**
   * Submits a vote for a specific option in a poll.
   * @param {string} pollId - The ID of the poll.
   * @param {number} optionIndex - The index of the selected option.
   * @param {string} voteToken - Unique token to prevent duplicate voting.
   * @returns {Promise<Object>} The updated poll document.
   */
  async submitVote(pollId, optionIndex, voteToken) {
    if (!voteToken || typeof voteToken !== 'string' || voteToken.trim().length === 0) {
      throw { status: 400, message: 'Valid vote token is required' };
    }

    // Hash token for privacy/security before storage
    const hashedVoteToken = crypto.createHash('sha256').update(voteToken.trim()).digest('hex');

    const targetPoll = await Poll.findById(pollId);
    if (!targetPoll) {
      throw { status: 404, message: 'Poll not found' };
    }

    if (optionIndex < 0 || optionIndex >= targetPoll.options.length) {
      throw { status: 400, message: 'Invalid option' };
    }

    try {
      // Attempt to record the vote tracking entry
      await VoteTracking.create({ pollId, tokenHash: hashedVoteToken });
    } catch (voteTrackingError) {
      // Handle duplicate vote attempt
      if (voteTrackingError.code === 11000) {
        throw { status: 403, message: 'You have already voted in this poll' };
      }
      throw voteTrackingError;
    }

    // Atomically increment vote count
    const pollWithNewVote = await Poll.findByIdAndUpdate(
      pollId,
      { 
        $inc: { 
          [`options.${optionIndex}.votes`]: 1, 
          totalVotes: 1 
        } 
      },
      { returnDocument: 'after' }
    );

    // Broadcast update to all connected clients in the poll room
    try {
      getIO().to(pollId).emit('updateResults', pollWithNewVote); 
    } catch (socketError) {
      console.error("Socket emit failed", socketError);
    }

    return pollWithNewVote;
  }
}

module.exports = new PollService();
