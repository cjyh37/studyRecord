const express = require('express');
const NodeCache = require('node-cache');
const router = express.Router();
const Lecture = require('../models/lecture'); // Lecture 모델 불러오기

const cache = new NodeCache();

router.get('/', async (req, res) => {
  try {
    let lectures = cache.get('lectures');
    if (!lectures) {
      lectures = await Lecture.find();
      cache.set('lectures', lectures);
    }

    res.render('index', { lectures });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;