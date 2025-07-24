const express = require('express')
const router = express.Router()
const passport = require('passport')
const bcrypt = require('bcrypt') // 암호화
const Member = require('../models/member')
const { isLoggedIn, isNotLoggedIn } = require('./middlewares')

// 회원가입 localhost:8000/auth/join
// 로그인이 안된 상태일때만 회원가입을 진행하도록 한다
router.post('/join', isNotLoggedIn, async (req, res, next) => {
   try {
      const { email, name, password } = req.body
      // 이메일로 기존 사용자 검색
      // select * from members where email = ? LIMIT 1;
      const exMember = await Member.findOne({
         where: { email },
      })

      // 이미 사용자가 존재할 경우 409 상태코드와 메세지를 json 객체로 전달
      if (exMember) {
         const error = new Error('이미 존재하는 사용자입니다.')
         error.status = 409 // Conflict
         return next(error) // 에러 미들웨어로 이동
      }

      // 이메일 중복 확인을 통과시 새로운 사용자 계정 생성

      // 비밀번호 암호화
      const hash = await bcrypt.hash(password, 12) // 12: salt(해시 암호화를 진행시 추가되는 임의의 데이터 주로 10 ~ 12 정도의 값이 권장됨)

      // 새로운 사용자 생성
      const newMember = await Member.create({
         email,
         name,
         password: hash,
      })

      // 성공 응답 반환
      res.status(201).json({
         success: true,
         message: '사용자가 성공적으로 등록되었습니다.',
         // insert 한 데이터 일부 전달
         member: {
            id: newMember.id,
            email: newMember.email,
            name: newMember.name,
         },
      })
   } catch (error) {
      // 에러발생시 미들웨어로 전달
      error.status = 500
      error.message = '회원가입 중 오류가 발생했습니다.'
      next(error)
   }
})

// 로그인 localhost:8000/auth/login
// 로그인이 안된 상태일때만 로그인을 하도록 한다
router.post('/login', isNotLoggedIn, async (req, res, next) => {
   // authenticate 함수는 localStrategy.js 에 작성한 인증과정을 실행한다. 그 과정에서 에러발생시 authError 객체에 값을 주고, 인증과정 성공시 member에는 인증과정에서 passport에 넘겨줬던 exMember값이 들어있다.
   passport.authenticate('local', (authError, member, info) => {
      if (authError) {
         // 로그인 인증 중 에러 발생시
         authError.status = 500
         authError.message = '인증 중 오류 발생'
         return next(authError) // 에러 미들웨어로 전달
      }

      if (!member) {
         // 비밀번호 불일치 or 사용자가 없을 경우 info.message를 사용해서 메세지 전달
         // 401: unauthorized, 로그인 과정에서 인증이 안 된 경우 사용
         const error = new Error(info.message || '로그인 실패')
         error.status = 401 // Unauthorized
         return next(error) // 에러 미들웨어로 전달
      }

      // 인증이 정상적으로 되고 사용자를 로그인 상태로 바꿈
      req.login(member, (loginError) => {
         if (loginError) {
            // 로그인 상태로 바꾸는 중 오류 발생시
            loginError.status = 500
            loginError.message = '로그인 중 오류 발생'
            return next(loginError)
         }

         // 로그인 성공시 user객체와 함께 response
         res.status(200).json({
            success: true,
            message: '로그인 성공',
            member: {
               id: member.id,
               name: member.nick,
            },
         })
      })
   })(req, res, next)
})

// 로그아웃 localhost:8000/auth/logout
// 로그인이 된 상태일때만 로그아웃을 하도록 한다
router.get('/logout', isLoggedIn, async (req, res, next) => {
   req.logout((logoutError) => {
      if (logoutError) {
         // 로그아웃 상태로 바꾸는 중 에러 발생시
         logoutError.status = 500
         logoutError.message = '로그아웃 중 오류 발생'
         return next(logoutError)
      }

      // 로그아웃 성공시 세션에 저장되어있던 사용자 id는 삭제된다
      // 로그아웃 성공시 response
      res.status(200).json({
         success: true,
         message: '로그아웃에 성공했습니다.',
      })
   })
})

// 현재 로그인 상태 확인 localhost:8000/auth/status
router.get('/status', async (req, res, next) => {
   try {
      if (req.isAuthenticated()) {
         // 로그인이 되었을때
         // req.user는 passport의 역직렬화 설정에 의해 로그인 되었을때 로그인 한 user 정보를 가져온다
         res.status(200).json({
            isAuthenticated: true,
            user: {
               id: req.member.id,
               name: req.member.name,
            },
         })
      } else {
         // 로그인이 되지 않았을때
         res.status(200).json({
            isAuthenticated: false,
         })
      }
   } catch (error) {
      error.status = 500
      error.message = '로그인 상태확인 중 오류가 발생했습니다.'
      next(error)
   }
})

module.exports = router
