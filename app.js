// app.js
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const http = require("http");
const expressLayouts = require("express-ejs-layouts");

const authRouter = require("./routes/auth");
const settingRouter = require('./routes/setting');
const indexRouter = require("./routes/index");
const lectureRouter = require("./routes/lecture");

const Setting = require('./models/setting');

const app = express();
const server = http.createServer(app);

const is_init = true;

// MongoDB 연결
mongoose.connect("mongodb://localhost/lecturedb");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");

  const Lecture = require("./models/lecture");

  if (!is_init) {
    // 강의 데이터 초기화
    const lectures = [
      {
        _id: "5f0e8a6b0d55a6f8b8c4d4a1",
        title: "Introduction to Web Development",
        description:
          "Learn the basics of web development using HTML, CSS, and JavaScript.",
        duration: 600, // 10분
        videoUrl: "/videos/sample.mp4",
      },
      {
        _id: "5f0e8a6b0d55a6f8b8c4d4a2",
        title: "Responsive Web Design",
        description:
          "Create responsive websites that adapt to different screen sizes and devices.",
        duration: 750, // 12분 30초
        videoUrl: "/videos/sample.mp4",
      },
      {
        _id: "5f0e8a6b0d55a6f8b8c4d4a3",
        title: "JavaScript Fundamentals",
        description:
          "Master the core concepts and syntax of JavaScript programming language.",
        duration: 900, // 15분
        videoUrl: "/videos/sample.mp4",
      },
      {
        _id: "5f0e8a6b0d55a6f8b8c4d4a4",
        title: "Database Management with SQL",
        description:
          "Learn how to create, query, and manage databases using SQL.",
        duration: 840, // 14분
        videoUrl: "/videos/sample.mp4",
      },
      {
        _id: "5f0e8a6b0d55a6f8b8c4d4a5",
        title: "Introduction to Data Structures and Algorithms",
        description:
          "Explore fundamental data structures and algorithms in computer science.",
        duration: 720, // 12분
        videoUrl: "/videos/sample.mp4",
      },
    ];

    Lecture.insertMany(lectures)
      .then(() => {
        console.log("Lecture data initialized");
      })
      .catch((error) => {
        console.error("Error initializing lecture data:", error);
      });
  }
});

// 세션 미들웨어 설정
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: "mongodb://localhost/lecturedb" }), // 세션 데이터를 MongoDB에 저장
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 세션 유효기간 24시간
    },
  })
);


// 로그인 확인 미들웨어
const authMiddleware = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect("/auth/login");
  }
  next();
};

// JSON 요청 본문 파싱 미들웨어 추가
app.use(express.json());

// 폼 데이터 파싱 미들웨어 추가
app.use(express.urlencoded({ extended: true }));

// 뷰 엔진 설정
app.set("view engine", "ejs");

// 정적 파일 서빙
app.use(express.static("public"));

// 레이아웃 설정
app.use(expressLayouts);
app.set("layout", "layouts/main");

// 인증 라우트에 대한 레이아웃 설정
app.use("/auth", (req, res, next) => {
  app.set("layout", "layouts/auth");
  next();
});

// 인증 라우트
app.use("/auth", authRouter);

// 인증 이후의 라우트에 대한 레이아웃 설정
app.use((req, res, next) => {
  app.set("layout", "layouts/main");
  next();
});

lectureRouter.io(server); // server 객체를 lecture 라우터에 전달

// SocketIO 클라이언트 라이브러리 제공을 위한 미들웨어 추가
app.use(
  "/socket.io",
  express.static(__dirname + "/node_modules/socket.io/client-dist")
);

app.use(async (req, res, next) => {
  try {
    if (req.session.userId) {
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

      res.locals.setting = setting;
    } else {
      res.locals.setting = {
        siteName: 'LMS',
        learningRecordMethod: 'polling',
      };
    }

    next();
  } catch (error) {
    console.error(error);
    next(error);
  }
});

app.use("/", indexRouter);
app.use("/lecture", authMiddleware, lectureRouter);
app.use('/setting', authMiddleware, settingRouter);

// 서버 시작
app.listen(3000, () => {
  console.log("Server is running on port http://127.0.0.1:3000");
});
