const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const socketSession = require('express-socket.io-session');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

dotenv.config();

const connectToDatabase = require('./config/database');
const authRouter = require("./routes/auth");
const settingRouter = require('./routes/setting');
const indexRouter = require("./routes/index");
const lectureRouter = require("./routes/lecture");
const expressLayouts = require("express-ejs-layouts");
const Setting = require('./models/setting');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);


// MongoDB 연결
connectToDatabase().catch(error => {
  console.error('Failed to connect to MongoDB:', error);
  process.exit(1);
});

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 세션 유효기간 24시간
  },
});

app.use(sessionMiddleware);
io.use(socketSession(sessionMiddleware));

// 소켓 연결 이벤트 처리
const Learning = require("./models/learning");
io.on("connection", (socket) => {
  console.log("socket connected");

  socket.on("join", (learningId) => {
    socket.join(learningId);
  });

  socket.on("learning", async (data) => {
    const { learningId, duration } = data;
    const userId = socket.handshake.session.user._id;

    try {
      const learning = await Learning.findOneAndUpdate(
        { _id: learningId, userId },
        { duration },
        { new: true }
      );

      // if (learning) {
      //   learning.duration = duration;
      //   await learning.save();
      // }

      if (learning) {
        io.to(learning.lectureId.toString()).emit('updateDuration', learning);
      }
    } catch (error) {
      console.error("Error updating learning duration:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("socket disconnected");
  });
});

const basicMiddleware = async (req, res, next) => {
  try {
    res.locals.setting = await Setting.findOne();
    res.locals.currentUser = req.session.user;
    next();
  } catch (error) {
    console.error(error);
    next(error);
  }
};

app.use(basicMiddleware);

app.use(function(err, req, res, next) {
  console.error(err.stack); // Log error stack trace to the console
  res.status(500).send('Something broke!');
});

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
  if (!req.session.user) {
    return res.redirect("/auth/login");
  }

  next();
};

//lectureRouter.io(server); // server 객체를 lecture 라우터에 전달

// 라우터 설정
app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/lecture", authMiddleware, lectureRouter);
app.use('/setting', authMiddleware, settingRouter);


// 서버 시작
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});