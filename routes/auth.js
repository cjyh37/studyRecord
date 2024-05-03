const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/user');

// 회원가입 페이지 렌더링
router.get('/register', (req, res) => {
  res.render('auth/register');
});

// 회원가입 처리
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, passwordConfirmation } = req.body;

    // 이메일 중복 검사
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('Email is already in use');
    }

     // 패스워드 확인
    if (password !== passwordConfirmation) {
      return res.status(400).send('Passwords do not match');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);


    // 새 사용자 생성
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    // 사용자를 세션에 저장
    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
    };

    // 홈페이지로 리다이렉트
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// 로그인 페이지 렌더링
router.get('/login', (req, res) => {
  res.render('auth/login');
});

// 로그인 처리
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send('Invalid email or password');
    }

    // Compare passwords
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).send('Invalid email or password');
    }

    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
    };

    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// 로그아웃 처리
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect('/');
  });
});

module.exports = router;