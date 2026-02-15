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
  
  // Get IP address (handle proxy/load balancer case)
  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  const pollWithNewVote = await pollService.submitVote(pollId, optionIndex, voteToken, ipAddress);
  res.status(200).json({ success: true, poll: pollWithNewVote });
});
