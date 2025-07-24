import { TextField, Button, Container, Typography, CircularProgress } from '@mui/material'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { registerUserThunk, clearAuthError } from '../../features/authSlice'
import { useNavigate } from 'react-router-dom'

function Signup() {
   const [email, setEmail] = useState('') // 이메일
   const [name, setname] = useState('') // 닉네임
   const [password, setPassword] = useState('') // 패스워드
   const [confirmPassword, setConfirmPassword] = useState('') // 패스워드 확인
   const [isSignupComplete, setIsSignupComplete] = useState(false) // 회원가입 완료 여부

   const dispatch = useDispatch()
   const navigate = useNavigate()
   const { loading, error } = useSelector((state) => state.auth)

   // 라우터를 사용해 경로가 바뀌면 이젠 컴포넌트는 언마운트가 된다
   // 이 뒷정리 함수는 컴포넌트가 언마운트 되기 직전에 실행된다
   // 즉, 컴포넌트가 언마운트 되기전에 error state가 null로 초기화 된다
   useEffect(() => {
      // 회원가입 컴포넌트를 벗어날때 error state가 null로 초기화
      return () => {
         dispatch(clearAuthError())
      }
   }, [dispatch])

   // 회원가입 버튼 클릭시 실행
   const handleSignup = () => {
      // 모든 필드를 입력했는지 확인
      if (!email.trim() || !name.trim() || !password.trim() || !confirmPassword.trim()) {
         alert('모든 필드를 입력해주세요!')
         return
      }

      // 비밀번호와 비밀번호 확인이 일치하는지 확인
      if (password !== confirmPassword) {
         alert('비밀번호가 일치하지 않습니다!')
         return
      }

      dispatch(registerUserThunk({ email, name, password }))
         .unwrap()
         .then(() => {
            // 회원가입 성공시
            setIsSignupComplete(true)
         })
         .catch((error) => {
            // error: auth의 error state
            // 회원가입 중 에러 발생시
            console.error('회원가입 에러: ', error)
         })
   }

   // 회원가입이 완료되었을때 보일 컴포넌트
   if (isSignupComplete) {
      return (
         <Container maxWidth="sm">
            <Typography variant="h4" gutterBottom align="center">
               회원가입이 완료되었습니다!
            </Typography>
            <Typography variant="body1" align="center" style={{ marginTop: '20px' }}>
               로그인 페이지로 이동하거나 다른 작업을 계속 진행할 수 있습니다.
            </Typography>
            <Button
               variant="contained"
               color="primary"
               fullWidth
               style={{ marginTop: '20px' }}
               onClick={() => navigate('/login')} // 로그인 페이지로 이동
            >
               로그인 하러 가기
            </Button>
         </Container>
      )
   }

   return (
      <Container maxWidth="sm">
         <Typography variant="h4" gutterBottom>
            회원가입
         </Typography>

         {error && (
            <Typography color="error" align="center">
               {error}
            </Typography>
         )}

         <TextField label="이메일" variant="outlined" fullWidth margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />

         <TextField label="사용자 이름" variant="outlined" fullWidth margin="normal" value={name} onChange={(e) => setname(e.target.value)} />

         <TextField label="비밀번호" variant="outlined" type="password" fullWidth margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />

         <TextField label="비밀번호 확인" variant="outlined" type="password" fullWidth margin="normal" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

         {/* 로딩 중이면 회원가입 버튼 비활성화 */}
         <Button variant="contained" color="primary" onClick={handleSignup} fullWidth disabled={loading} style={{ marginTop: '20px' }}>
            {loading ? <CircularProgress size={24} /> : '회원가입'}
         </Button>
      </Container>
   )
}

export default Signup
