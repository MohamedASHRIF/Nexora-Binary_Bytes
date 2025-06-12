import express from 'express';
import { protect } from '../middleware/auth';

const router = express.Router();

// Get cafeteria menu
router.get('/menu', protect, async (req, res) => {
  try {
    // TODO: Implement menu fetching logic
    res.json({
      status: 'success',
      data: {
        menu: [
          {
            day: 'Monday',
            items: [
              { name: 'Breakfast', options: ['Oatmeal', 'Fruits', 'Coffee'] },
              { name: 'Lunch', options: ['Sandwich', 'Salad', 'Soup'] },
              { name: 'Dinner', options: ['Pasta', 'Chicken', 'Vegetables'] }
            ]
          }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch cafeteria menu'
    });
  }
});

// Get cafeteria hours
router.get('/hours', protect, async (req, res) => {
  try {
    // TODO: Implement hours fetching logic
    res.json({
      status: 'success',
      data: {
        hours: {
          monday: { open: '7:00 AM', close: '8:00 PM' },
          tuesday: { open: '7:00 AM', close: '8:00 PM' },
          wednesday: { open: '7:00 AM', close: '8:00 PM' },
          thursday: { open: '7:00 AM', close: '8:00 PM' },
          friday: { open: '7:00 AM', close: '8:00 PM' },
          saturday: { open: '9:00 AM', close: '6:00 PM' },
          sunday: { open: '9:00 AM', close: '6:00 PM' }
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch cafeteria hours'
    });
  }
});

export default router; 