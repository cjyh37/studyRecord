const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const dotenv = require('dotenv');
const connectToDatabase = require('./config/database');
const authRouter = require("./routes/auth");
const settingRouter = require('./routes/setting');
const indexRouter = require("./routes/index");
const lectureRouter = require("./routes/lecture");
const expressLayouts = require("express-ejs-layouts");
const Setting = require('./models/setting');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

let currentUser = null;

// MongoDB 연결
connectToDatabase();

// 소켓 연결 이벤트 처리
io.on('connection', (socket) => { });

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 세션 유효기간 24시간
  },
});

const basicMiddleware = async (req, res, next) => {
  try {
    res.locals.setting = await Setting.findOne();
    res.locals.currentUser = req.session.userId;

    next();
  } catch (error) {
    console.error(error);
    next(error);
  }
};

app.use(sessionMiddleware);
app.use(basicMiddleware);
app.use(expressLayouts);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set("layout", "layouts/main"); // 레이아웃 설정


app.use('/socket.io', express.static(path.join(__dirname, 'node_modules', 'socket.io', 'client-dist'))); // Socket.IO 미들웨어 설정
app.use('/videojs', express.static(path.join(__dirname, 'node_modules', 'video.js', 'dist'))); // Video.js 미들웨어 설정

// 로그인 확인 미들웨어
const authMiddleware = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect("/auth/login");
  }
  currentUser = req.session.userId;

  next();
};

lectureRouter.io(server); // server 객체를 lecture 라우터에 전달

// 라우터 설정
app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/lecture", authMiddleware, lectureRouter);
app.use('/setting', authMiddleware, settingRouter);

// 서버 시작
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = io;

/*
dotenv.config(); // .env 파일에서 환경 변수 로드

const authRouter = require("./routes/auth");
const settingRouter = require('./routes/setting');
const indexRouter = require("./routes/index");
const lectureRouter = require("./routes/lecture");

const Setting = require('./models/setting');


const app = express();
const server = http.createServer(app);
const io = socketIO(server);

let currentUser = null;

app.use('/socket.io', express.static(path.join(__dirname, 'node_modules', 'socket.io', 'client-dist')));

// MongoDB 연결
connectToDatabase();

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



app.use(async (req, res, next) => {
  try {
    res.locals.setting = await Setting.findOne();
    res.locals.currentUser = req.session.userId;

    next();
  } catch (error) {
    console.error(error);
    next(error);
  }
});



// 로그인 확인 미들웨어
const authMiddleware = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect("/auth/login");
  }
  currentUser = req.session.userId;

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


app.use("/", indexRouter);
app.use("/lecture", authMiddleware, lectureRouter);
app.use('/setting', authMiddleware, settingRouter);

// 서버 시작
app.listen(3000, () => {
  console.log("Server is running on port http://127.0.0.1:3000");
});
*/