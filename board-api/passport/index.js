// 로그인 상태 유지 및 관리. 로그인에 성공한 사용자를 어떻게 기억하고, 다음 요청이 왔을 때 어떻게 알아볼지에 대한 규칙(세션 관리)을 정의합니다.
const passport = require('passport')
const local = require('./localStrategy')
const Member = require('../models/member')

// possport에 로그인 인증과정, 직렬화, 역직렬화를 등록해 둔다
module.exports = () => {
   // 직렬화(serializeUser): 로그인 성공 후 사용자 정보를 세션에 저장
   /*
    * 1. 직렬화 (Serialization): 로그인 성공 시 딱 한 번 호출됨
    * 사용자 정보 객체를 세션에 저장하기 용이한 작은 데이터(주로 id)로 바꾸는 과정
    */
   passport.serializeUser((member, done) => {
      // localStrategy에서 done(null, exUser)의 exUser가 여기 user로 들어옴
      // 세션에 전체 사용자 정보를 저장하면 무거우므로, 식별자인 id만 저장함
      console.log('🙌Member: ', member) // 사용자 정보가 저장되어 있는 객체
      done(null, member.id) // member테이블의 id 값(pk)을 세션에 저장(세션 용량 절약을 위해 id만 저장)
   })

   // 역직렬화(deserializeUser): 클라이언트에게 request가 올 때마다 세션에 저장된 사용자 id(user 테이블의 id컬럼 값-pk-현재 email을 id로 사용 중)를 바탕으로 사용자 정보를 조회
   /*
    * 2. 역직렬화 (Deserialization): 로그인 후 모든 요청이 올 때마다 호출됨
    * 세션에 저장된 id를 이용해 전체 사용자 정보를 DB에서 조회하여 복원하는 과정
    */
   passport.deserializeUser((id, done) => {
      // serializeUser에서 done(null, user.id)로 저장했던 id가 여기로 들어옴
      // id는 직렬화에서 저장한 user.id
      // response 해주고 싶은 사용자 정보를 가져온다
      // select id, nick, email, createdAt, updatedAt from users where id = ? limit 1
      User.findOne({
         where: { id },
         // 필요한 사용자 정보 컬럼들을 지정
         attributes: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
      })
         // 조회된 user 객체를 done 콜백으로 전달. 이 user 객체는 req.user에 저장됨.
         .then((member) => done(null, member)) // 성공 시 가져온 사용자 객체 정보를 반환
         .catch((err) => done(err)) // 에러 발생시 에러 반환
   })
   // 3. 위에서 만든 LocalStrategy를 Passport가 사용하도록 등록
   local() // localStrategy.js 에서 export된 함수(인증과정함수)를 Passport에 추가
}
