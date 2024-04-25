const express = require('express');
const router = express.Router();
const Lecture = require('../models/lecture'); // Lecture 모델 불러오기


router.get('/', async (req, res) => {
    try {
        const lectures = await Lecture.find();
        res.render('index', { lectures });
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
});

module.exports = router;