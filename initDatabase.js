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
        id: "5f0e8a6b0d55a6f8b8c4d4a1",
        title: "웹 개발 입문",
        description: "HTML, CSS, JavaScript를 사용하여 웹 개발의 기초를 배웁니다.",
        duration: 300, // 5분
        videoUrl: "/videos/sample.mp4",
        thumbnailUrl: "/images/web-dev-intro.webp" // Placeholder URL
    },
    {
        id: "5f0e8a6b0d55a6f8b8c4d4a2",
        title: "반응형 웹 디자인",
        description: "다양한 화면 크기와 장치에 적응하는 반응형 웹사이트를 만듭니다.",
        duration: 375, // 6분 15초
        videoUrl: "/videos/sample.mp4",
        thumbnailUrl: "/images/responsive-design.webp"
    },
    {
        id: "5f0e8a6b0d55a6f8b8c4d4a3",
        title: "JavaScript 기초",
        description: "JavaScript 프로그래밍 언어의 핵심 개념과 문법을 마스터합니다.",
        duration: 450, // 7분 30초
        videoUrl: "/videos/sample.mp4",
        thumbnailUrl: "/images/javascript-basics.webp"
    },
    {
        id: "5f0e8a6b0d55a6f8b8c4d4a4",
        title: "SQL을 사용한 데이터베이스 관리",
        description: "SQL을 사용하여 데이터베이스를 생성, 쿼리 및 관리하는 방법을 배웁니다.",
        duration: 300, // 5분
        videoUrl: "/videos/sample.mp4",
        thumbnailUrl: "/images/sql-database.webp"
    },
    {
        id: "5f0e8a6b0d55a6f8b8c4d4a5",
        title: "자료구조와 알고리즘 입문",
        description: "컴퓨터 과학에서 기본적인 자료구조와 알고리즘을 탐색합니다.",
        duration: 360, // 6분
        videoUrl: "/videos/sample.mp4",
        thumbnailUrl: "/images/data-structures.webp"
    },
    {
        id: "5f0e8a6b0d55a6f8b8c4d4a6",
        title: "Node.js 백엔드 개발",
        description: "Node.js를 사용하여 서버 측 애플리케이션을 개발하는 방법을 배웁니다.",
        duration: 420, // 7분
        videoUrl: "/videos/sample.mp4",
        thumbnailUrl: "/images/nodejs-backend.webp"
    },
    {
        id: "5f0e8a6b0d55a6f8b8c4d4a7",
        title: "ReactJS 프론트엔드 개발",
        description: "ReactJS 라이브러리를 사용하여 인터랙티브한 사용자 인터페이스를 구축합니다.",
        duration: 480, // 8분
        videoUrl: "/videos/sample.mp4",
        thumbnailUrl: "/images/reactjs-frontend.webp"
    },
    {
        id: "5f0e8a6b0d55a6f8b8c4d4a8",
        title: "Git 버전 관리",
        description: "Git을 사용하여 코드의 버전을 관리하고 협업하는 방법을 배웁니다.",
        duration: 330, // 5분 30초
        videoUrl: "/videos/sample.mp4",
        thumbnailUrl: "/images/git-version-control.webp"
    }
];

// 환경설정 데이터 초기화
const settings = [
    {
        siteName: '학습관리시스템',
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