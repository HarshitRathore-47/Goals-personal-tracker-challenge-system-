import express from 'express';
import { body, validationResult } from 'express-validator';
import Tracker from '../models/Tracker.js'; // Ensure you have the correct import for your Tracker model
const router = express.Router();
// POST /submit-tracker
router.post('/submit-tracker', [
    body('sleepHours').isNumeric().withMessage('Sleep hours must be a number'),
    body('waterLiters').isNumeric().withMessage('Water liters must be a number'),
    body('screenTime').isNumeric().withMessage('Screen time must be a number'),
    body('gymTime').isNumeric().withMessage('Gym time must be a number'),
    body('mealsCount').isNumeric().withMessage('Meals count must be a number'),
    body('fvServings').isNumeric().withMessage('Fruit and vegetable servings must be a number'),
    body('stepsWalked').isNumeric().withMessage('Steps walked must be a number')
], async (req, res) => {
    // Check if the user is logged in
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    // Extract user email from session
    const userEmail = req.session.user === 'string'
        ? req.session.user
        : req.session.user.email;
    if (!userEmail) {
        return res.status(400).json({ error: 'User email not found in session' });
    }
    // Validate incoming data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const {
        sleepHours,
        waterLiters,
        screenTime,
        gymTime,
        mealsCount,
        fvServings,
        stepsWalked
    } = req.body;
    // Calculate score using provided weights
    const score = Math.max(0, Math.min(100,
        (sleepHours * 2) +
        (gymTime * 2) +
        (fvServings * 1.5) +
        (waterLiters * 3) -
        (screenTime * 1.5)
    ));
    try {
        // Save tracker data to the database
        await Tracker.create({
            email: userEmail,
            sleepHours,
            waterLiters,
            screenTime,
            gymTime,
            mealsCount,
            fvServings,
            stepsWalked,
            score,
            date: new Date() // Record the current date
        });
        // Respond with success status and calculated score
        res.json({ success: true, score });
    } catch (err) {
        console.error('Tracker error:', err);
        res.status(500).json({ error: 'Failed to save tracker data' });
    }
});
// GET /latest-tracker
router.get('/latest-tracker', async (req, res) => {
    // Check if the user is logged in
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    // Extract user email from session
    const userEmail = typeof req.session.user === 'string'
        ? req.session.user
        : req.session.user.email;
    try {
        // Find the latest tracker entry for the user
        const latest = await Tracker.findOne({ email: userEmail }).sort({ date: -1 });
        if (!latest) return res.json({ score: null }); // If no entry found, respond with null score
        // Respond with the latest score and date
        res.json({ score: latest.score, date: latest.date });
    } catch (err) {
        console.error('Error fetching latest tracker:', err);
        res.status(500).json({ error: 'Failed to fetch latest tracker data' });
    }
});

router.get('/my-logs', async (req, res) => {
    // Check if the user is logged in
    if (!req.session.user) {
        return res.status(401).json({ success: false, error: 'Not logged in' });
    }
    // Extract user email from session
    const userEmail = typeof req.session.user === 'string'
        ? req.session.user
        : req.session.user.email;
    try {
        // Find logs associated with the user's email, limiting to 30 logs, sorted by date
        const logs = await Tracker.find({ email: userEmail })
            .sort({ date: -1 }) // Sort latest entries first
            .limit(30); 
        // Respond with success and the logs or an empty array if none found
        res.json({ success: true, logs });
    } catch (err) {
        console.error('Error fetching logs:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});
export default router; 
