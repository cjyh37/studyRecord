const express = require('express');
const router = express.Router();
const Setting = require('../models/setting');

// 환경설정 페이지 렌더링
router.get('/', async (req, res) => {
    try {
        const userId = req.session.userId;
        let setting = await Setting.findOne({ userId });

        if (!setting) {
            setting = new Setting({
                userId,
                siteName: 'LMS',
                learningRecordMethod: 'polling',
            });
            await setting.save();
        }

        res.render('setting', { setting });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// 환경설정 업데이트
router.post('/', async (req, res) => {
    try {
        const userId = req.session.userId;
        const { siteName, learningRecordMethod } = req.body;

        const setting = await Setting.findOneAndUpdate(
            { userId },
            { siteName, learningRecordMethod },
            { new: true }
        );

        res.locals.setting = setting;

        res.redirect('/setting');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;