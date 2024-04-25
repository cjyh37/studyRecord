const mongoose = require('mongoose');

const learningSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  lectureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lecture',
    required: true,
  },
  duration: {
    type: Number,
    default: 0,
  },
  method: {
    type: String,
    enum: ['XHR Polling', 'SSE', 'SocketIO'],
    default: 'XHR Polling',
  },
});

learningSchema.index({ userId: 1, lectureId: 1 }, { unique: true });

const Learning = mongoose.model('Learning', learningSchema);

module.exports = Learning;