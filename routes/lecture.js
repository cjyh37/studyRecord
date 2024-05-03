const express = require("express");
const router = express.Router();
const NodeCache = require('node-cache');
const Lecture = require("../models/lecture");
const Learning = require("../models/learning");

const cache = new NodeCache();



// SSE 엔드포인트
router.get('/sse/:learningId', async (req, res) => {
  const learningId = req.params.learningId;
  let isFirst = true;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });


  // 1초마다 학습 시간 저장
  const intervalId = setInterval(async () => {
    try {
      const learning = await Learning.findById(learningId);
      if (learning) {

        if (isFirst){
          learning.duration+=2;
          isFirst = false;
        } else {
          learning.duration++;
        }

        await learning.save();
        res.write(`data: ${JSON.stringify(learning)}\n\n`);
      }
    } catch (error) {
      console.error('Error saving learning time with SSE:', error);
    }
  }, 1000);

  // 연결 종료 시 인터벌 클리어
  req.on('close', () => {
    clearInterval(intervalId);
    res.end();
  });
});

// 강의 페이지 렌더링
router.get('/:lectureId', async (req, res) => {
  const lectureId = req.params.lectureId;
  const userId = req.session.user._id;

  try {
    // 강의 정보 캐싱
    let lecture = cache.get(`lecture_${lectureId}`);
    if (!lecture) {
      lecture = await Lecture.findById(lectureId);
      if (!lecture) {
        return res.status(404).send('Lecture not found');
      }
      cache.set(`lecture_${lectureId}`, lecture);
    }

    // 강의 목록 캐싱
    let lectureList = cache.get('lectureList');
    if (!lectureList) {
      lectureList = await Lecture.find();
      cache.set('lectureList', lectureList);
    }

    let learningRecords = await Learning.find({ userId });
    let learning = await Learning.findOne({ userId, lectureId });
    if (!learning) {
      learning = new Learning({
        userId,
        lectureId,
        duration: 0,
      });
      await learning.save();
    }

    let setting = res.locals.setting;

    res.set('Cache-Control', 'no-cache');
    res.render('lecture', {
      lecture,
      lectureList,
      learning,
      learningRecords,
      setting,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// 학습 시간 및 방법 업데이트 API
router.put("/api/learning/:id", async (req, res) => {
  const learningId = req.params.id;
  const { duration, method } = req.body;

  try {
    const learning = await Learning.findById(learningId);
    if (!learning) {
      return res.status(404).send('Learning not found');
    }

    if (duration <= learning.duration) {
      return res.json(learning);
    }

    learning.duration = duration;

    const lecture = await Lecture.findById(learning.lectureId);
    if (duration >= lecture.duration) {
      learning.duration = lecture.duration;
    }

    await learning.save();
    res.json(learning);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 학습 데이터 초기화 API
router.delete('/api/learning/:id', async (req, res) => {
  const learningId = req.params.id;
  const userId = req.session.user._id;

  try {
    const learning = await Learning.findOneAndDelete({ _id: learningId, userId });

    if (!learning) {
      return res.status(404).json({ error: 'Learning not found' });
    }

    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 캐시 삭제 라우트
router.post('/clear-cache', (req, res) => {
  cache.flushAll();
  res.sendStatus(200);
});

module.exports = router;