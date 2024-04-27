const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    siteName: {
        type: String,
        default: 'LMS',
    },
    learningRecordMethod: {
        type: String,
        enum: ['polling', 'sse', 'socketio'],
        default: 'polling',
    },
});

const Setting = mongoose.model('Setting', settingSchema);

module.exports = Setting;