const pollService = require('../services/poll.service');
const asyncHandler = require('../../../shared/utils/asyncHandler');

exports.handleCreatePoll = asyncHandler(async (req, res) => {
  const { question, options } = req.body;
  const createdPoll = await pollService.createNewPoll(question, options);
  res.status(201).json({ success: true, link: `/poll/${createdPoll._id}`, poll: createdPoll });
});

exports.handleGetPoll = asyncHandler(async (req, res) => {
  const fetchedPoll = await pollService.getPollById(req.params.id);
  res.status(200).json({ success: true, poll: fetchedPoll });
});

exports.handleVotePoll = asyncHandler(async (req, res) => {
  const { optionIndex, voteToken } = req.body;
  const pollId = req.params.id;
  
  // Robust IP extraction
  let ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  
  // If x-forwarded-for contains multiple IPs, take the first one
  if (ipAddress.includes(',')) {
      ipAddress = ipAddress.split(',')[0].trim();
  }

  // Normalize IPv6 localhost
  if (ipAddress === '::1') ipAddress = '127.0.0.1';

  const userAgent = req.headers['user-agent'] || 'unknown';

  console.log(`[Vote Attempt] Poll: ${pollId}, IP: ${ipAddress}, UA: ${userAgent.substring(0, 20)}...`);

  const pollWithNewVote = await pollService.submitVote(pollId, optionIndex, voteToken, ipAddress, userAgent);
  res.status(200).json({ success: true, poll: pollWithNewVote });
});
