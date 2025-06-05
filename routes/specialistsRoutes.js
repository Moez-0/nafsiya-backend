const express = require('express');
const {
  getSpecialists,
  getSpecialist,
  createSpecialist,
  updateSpecialist
} = require('../controllers/specialistController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.route('/')
  .get(getSpecialists)
  .post(protect, createSpecialist);

router.route('/:id')
  .get(getSpecialist)
  .put(protect, updateSpecialist);

module.exports = router;