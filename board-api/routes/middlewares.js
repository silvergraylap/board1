// 로그인 상태 확인 미들웨어: 사용자가 로그인된 상태인지 확인
exports.isLoggedIn = (req, res, next) => {
   if (req.isAuthenticated()) {
      next() // 로그인이 됐으면 다음 미들웨어로 이동
   } else {
      // 로그인이 되지 않았을경우 에러 미들웨어로 에러 전송
      const error = new Error('로그인이 필요합니다.')
      error.status = 403
      return next(error)
   }
}

// 비로그인 상태 확인 미들웨어: 사용자가 로그인 안된 상태인지 확인
exports.isNotLoggedIn = (req, res, next) => {
   if (!req.isAuthenticated()) {
      // 로그인이 되지 않았을 경우 다음 미들웨어로 이동
      next()
   } else {
      // 로그인이 된 경우 에러 미들웨어로 에러 전송
      const error = new Error('이미 로그인이 된 상태입니다.')
      error.status = 400
      return next(error)
   }
}

/* 
아주 좋은 질문입니다! 코드 편집기에서 res가 활성화되지 않은(회색으로 보이는) 이유는 그 함수 안에서 res를 직접 사용하지 않았기 때문이지만, 그럼에도 불구하고 반드시 포함해야 하는 이유가 있습니다.

결론적으로, next 함수를 올바르게 사용하기 위해 Express 미들웨어의 정해진 인수 순서 약속을 지켜야 하기 때문입니다.

## Express 미들웨어의 약속
Express의 미들웨어 함수는 항상 req (요청), res (응답), next (다음 미들웨어) 순서로 세 개의 인수를 받도록 설계되어 있습니다. Express는 어떤 미들웨어가 실행될 때 이 세 가지 도구를 순서대로 모두 전달해 줍니다.

## 인수의 위치가 중요한 이유
자바스크립트에서 함수의 인수는 이름이 아니라 위치로 결정됩니다.

올바른 코드: (req, res, next) => { ... }

첫 번째 위치에는 req 객체가 들어옵니다.

두 번째 위치에는 res 객체가 들어옵니다.

세 번째 위치에는 next 함수가 들어옵니다.

잘못된 코드: (req, next) => { ... }

만약 res를 사용하지 않는다고 생략해 버리면, 자바스크립트는 두 번째 위치에 들어온 res 객체를 next라는 이름의 변수에 할당해 버립니다.

결국 next는 함수가 아니므로 next()를 호출하는 순간 TypeError: next is not a function 오류가 발생하게 됩니다.

따라서 세 번째 인수인 next 함수에 접근하려면, 그 앞에 있는 req와 res를 반드시 선언해 주어야 합니다. 비록 isLoggedIn 함수가 응답(res)을 직접 보내지는 않지만, next를 사용하기 위해 res를 자리에 포함시켜야 하는 것입니다.
*/
