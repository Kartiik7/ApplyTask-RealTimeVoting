const express = require('express');
const router = express.Router();
const { createPoll, getPoll, votePoll } = require('../controllers/pollController');
const rateLimit = require('express-rate-limit');

// Rate limiting for voting: 5 votes per 5 minutes per IP
const voteLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, 
    max: 5, 
    message: { success: false, error: 'Too many vote attempts. Try again later.' },
    standardHeaders: true, 
    legacyHeaders: false,
});

router.post('/', createPoll);
router.get('/:id', getPoll);
router.post('/:id/vote', voteLimiter, votePoll);

module.exports = router;
