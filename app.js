// app.js
const express = require("express");
const dotenv = require('dotenv');
const connectToDatabase = require('./config/database');
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const http = require("http");
const expressLayouts = require("express-ejs-layouts");

dotenv.config(); // .env 파일에서 환경 변수 로드

const authRouter = require("./routes/auth");
const settingRouter = require('./routes/setting');
const indexRouter = require("./routes/index");
const lectureRouter = require("./routes/lecture");

const Setting = require('./models/setting');


const app = express();
const server = http.createServer(app);

const is_init = true;

let currentUser = null;


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
    res.locals.currentUser = currentUser;

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
  currentUser = {
    _id: req.session.userId,
  };

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

app.use("/", indexRouter);
app.use("/lecture", authMiddleware, lectureRouter);
app.use('/setting', authMiddleware, settingRouter);

// 로그아웃 처리
app.get('/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    }
    currentUser = null;
    res.redirect('/');
  });
});

// 서버 시작
app.listen(3000, () => {
  console.log("Server is running on port http://127.0.0.1:3000");
});
