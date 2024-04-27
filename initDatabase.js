const dotenv = require('dotenv');
const connectToDatabase = require('./config/database');

dotenv.config(); // .env 파일에서 환경 변수 로드

const Lecture = require('./models/lecture');
const Setting = require('./models/setting');
const User = require('./models/user');
const Learning = require('./models/learning');

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

// 환경설정 데이터 초기화
const settings = [
    {
        siteName: 'LMS',
        learningRecordMethod: 'polling',
    }
];

// 사용자 데이터 초기화
const users = [
    {
        "_id": "662c539b324c911170b0c2a9",
        "email": "test@test.com",
        "password": "1234",
    }
];

async function initDatabase() {
    try {
        await connectToDatabase();

        // 기존 데이터 삭제
        await Lecture.deleteMany({});
        await Setting.deleteMany({});
        await User.deleteMany({});
        await Learning.deleteMany({});

        // 강의 데이터 초기화
        await Lecture.insertMany(lectures);
        console.log('Lecture data initialized');

        // 설정 데이터 초기화
        await Setting.insertMany(settings);
        console.log('Setting data initialized');

        // 사용자 데이터 초기화
        await User.insertMany(users);
        console.log('Users data initialized');

        process.exit(0);
    } catch (error) {
        console.error('Database initialization error:', error);
        process.exit(1);
    }
}

initDatabase();