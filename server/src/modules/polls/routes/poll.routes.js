const express = require('express');
const router = express.Router();
const { handleCreatePoll, handleGetPoll, handleVotePoll } = require('../controllers/poll.controller');
const rateLimit = require('express-rate-limit');

const voteLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, 
    max: 10, 
    message: { success: false, error: 'Too many vote attempts for this poll. Try again later.' },
    standardHeaders: true, 
    keyGenerator: (req) => {
        return req.ip + "_" + req.params.id;
    },
    validate: { ip: false }
});

router.post('/', handleCreatePoll);
router.get('/:id', handleGetPoll);
router.post('/:id/vote', voteLimiter, handleVotePoll);

module.exports = router;
