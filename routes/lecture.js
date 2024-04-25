const express = require("express");
const router = express.Router();
const Lecture = require("../models/lecture");
const Learning = require("../models/learning");
const socketIO = require("socket.io");

let io;

// 시간을 시간과 분 형식으로 변환하는 함수
function formatDuration(duration) {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  return `${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
}

router.io = function (server) {
  io = socketIO(server);

  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("join", (learningId) => {
      socket.join(learningId);
    });

    socket.on("learning", async (data) => {
      const { learningId, currentTime } = data;
      try {
        const learning = await Learning.findById(learningId);
        if (learning) {
          learning.duration = currentTime;
          await learning.save();
          io.to(learningId).emit("updateDuration", learning);
        }
      } catch (error) {
        console.error("Error updating learning duration:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
};

// 강의 페이지 렌더링
router.get("/:lectureId", async (req, res) => {
  const lectureId = req.params.lectureId;
  const userId = req.session.userId;

  try {
    const lecture = await Lecture.findById(lectureId);

    if (!lecture) {
      return res.status(404).send("Lecture not found");
    }

    const lectureList = await Lecture.find();

    let learning = await Learning.findOne({ userId, lectureId });
    if (!learning) {
      learning = new Learning({
        userId,
        lectureId,
        duration: 0,
      });
      await learning.save();
    }

    res.render("lecture", {
      lecture,
      lectureList,
      learning: {
        ...learning.toObject(),
        duration: Math.floor(learning.duration),
        formattedDuration: formatDuration(Math.floor(learning.duration)),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// 학습 시간 및 방법 업데이트 API
router.put("/api/learning/:id", async (req, res) => {
  const learningId = req.params.id;
  const { duration, method } = req.body;

  try {
    const learning = await Learning.findById(learningId);
    if (!learning) {
      return res.status(404).send("Learning not found");
    }

    if (duration) {
      if (duration <= learning.duration) {
        return res.json(learning);
      }

      learning.duration = duration;

      const lecture = await Lecture.findById(learning.lectureId);
      if (duration >= lecture.duration) {
        learning.duration = lecture.duration;
      }
    }

    if (method) {
      learning.method = method;
    }

    await learning.save();
    res.json({
      ...learning.toObject(),
      duration: learning.duration,
    });    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 강의 정보 가져오기 함수
async function getLecture(lectureId) {
  // 실제로는 데이터베이스에서 강의 정보를 가져와야 합니다.
  // 여기서는 예시로 하드코딩된 데이터를 사용합니다.
  return {
    id: lectureId,
    title: "Sample Lecture",
    videoUrl: "/videos/sample.mp4",
  };
}

// 강의 목록 가져오기 함수
async function getLectureList(lectureId) {
  // 실제로는 데이터베이스에서 강의 목록을 가져와야 합니다.
  // 여기서는 예시로 하드코딩된 데이터를 사용합니다.
  return [
    { id: "1", title: "Lecture 1" },
    { id: "2", title: "Lecture 2" },
    { id: "3", title: "Lecture 3" },
  ];
}

module.exports = router;
