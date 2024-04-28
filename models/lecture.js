const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema({
  title: String,
  description: String,
  duration: Number,
  videoUrl: String,
  thumbnailUrl: String,
});

const Lecture = mongoose.model('Lecture', lectureSchema);

module.exports = Lecture;