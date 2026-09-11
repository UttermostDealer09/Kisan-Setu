import express from 'express';
const router = express.Router();

// Route for Village Agent to book on behalf of a farmer
router.post('/book-agent', express.json(), (req, res) => {
    const { farmerName, phone, cropType, expectedWeight } = req.body;

    if (!farmerName || !phone || !cropType || !expectedWeight) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    // Generate a unique offline token/receipt ID
    const tokenNumber = 'AG-' + Math.floor(1000 + Math.random() * 9000);

    // Return success response with the generated token
    res.status(201).json({
        success: true,
        message: 'Slot booked successfully by Village Agent!',
        data: {
            tokenNumber,
            farmerName,
            phone,
            cropType,
            expectedWeight,
            timestamp: new Date().toISOString()
        }
    });
});

export default router;