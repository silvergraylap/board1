// ID/비밀번호 검증 절차 정의. 사용자가 입력한 이메일과 비밀번호가 우리 데이터베이스에 있는 정보와 일치하는지 확인하는 구체적인 방법을 정의합니다.
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt') // 암호화된 비밀번호를 비교하기 위해 import
const Member = require('../models/member')

// 로그인 시 사용자 정보를 DB에서 조회하고, 사용자 존재 여부와 비밀번호 비교(인증과정)
module.exports = () => {
   passport.use(
      // 1. LocalStrategy에 대한 설정
      new LocalStrategy(
         {
            // 프론트에서 req.body에 담아 보낼 데이터의 필드 이름을 지정
            // input 태그에서 name으로 사용하는 이름을 지정
            usernameField: 'email', // req.body.email = '1234@test.com'
            passwordField: 'password', // req.body.password = '1234'
         },
         // 실제 로그인 인증 로직
         // 2. 실제 로그인 인증을 실행하는 함수 (가장 중요한 부분)
         // 위에서 받은 email, password가 이 함수의 인자로 들어옴
         // done은 인증 결과를 Passport에 알리는 콜백 함수
         async (email, password, done) => {
            // email: 사용자가 입력한 email 값을 가져다준다
            // password: 사용자가 입력한 password 값을 가져다준다
            try {
               // 3. DB에서 사용자가 입력한 이메일로 사용자 정보 조회
               // 1) 이메일로 사용자 조회
               // select * from users where email = ? limit 1
               console.log('인증중')
               const exMember = await Member.findOne({ where: { email } })
               // 4. 사용자가 존재한다면, 비밀번호 비교
               // 2) 이메일 해당하는 사용자가 있으면 비밀번호가 맞는지 확인

               console.log(exMember)
               if (exMember) {
                  // 사용자가 입력한 비밀번호와 DB의 암호화된 비밀번호를 bcrypt가 비교
                  const result = await bcrypt.compare(password, exMember.password)

                  console.log('result:', result)
                  if (result) {
                     // 5-1. 비밀번호 일치: 인증 성공!
                     // done(서버 에러, 성공 사용자 객체)
                     // 비밀번호가 일치하면 사용자 객체를 passport에 반환
                     done(null, exMember)
                  } else {
                     // 5-2. 비밀번호 불일치: 인증 실패!
                     // done(서버 에러, 성공 여부, 실패 메시지)
                     // 비밀번호가 일치하지 않는 경우 message를 passport에 반환
                     done(null, false, { message: '비밀번호가 일치하지 않습니다.' })
                  }
               } else {
                  // 6. 사용자가 존재하지 않으면: 인증 실패!
                  // 3) 이메일에 해당하는 사용자가 없는 경우 message를 passport에 반환
                  done(null, false, { message: '가입되지 않은 회원입니다.' })
               }
            } catch (error) {
               // 7. 조회/비교 과정에서 서버 에러 발생 시
               console.log(error)
               done(error) // passport에 에러 객체 전달 -> 이후 passport에서 에러 미들웨어로 전달
            }
         }
      )
   )
}
