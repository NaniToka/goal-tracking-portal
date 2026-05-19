const express = require('express');
const authRoutes = require('./authRoutes');
const goalRoutes = require('./goalRoutes');
const managerRoutes = require('./managerRoutes');
const adminRoutes = require('./adminRoutes');
const reportRoutes = require('./reportRoutes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Goal Tracking Portal API is running' });
});

router.use('/auth', authRoutes);
router.use('/goals', goalRoutes);
router.use('/manager', managerRoutes);
router.use('/admin', adminRoutes);
router.use('/reports', reportRoutes);

// Thrust areas reference data
router.get('/thrust-areas', (req, res) => {
  res.json({
    success: true,
    thrustAreas: [
      'Revenue Growth',
      'Customer Experience',
      'Operational Excellence',
      'Innovation & R&D',
      'People & Culture',
      'Digital Transformation',
      'Quality & Compliance',
      'Cost Optimization',
    ],
  });
});

module.exports = router;
