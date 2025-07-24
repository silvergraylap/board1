import { TextField, Button, Box } from '@mui/material'
import { useState } from 'react'

function PostCreateForm({ onPostCreate }) {
   const [imgUrl, setImgUrl] = useState('') // 이미지 경로(파일명 포함)
   const [imgFile, setImgFile] = useState(null) // 이미지 파일 객체
   const [content, setContent] = useState('') // 게시물 내용
   const [hashtags, setHashtags] = useState('') //해시태그

   // 이미지 미리보기
   const handleImageChange = (e) => {
      /*
       e.target.files: 업로드한 파일 객체를 배열형태로 가져온다
       e.target.files = [File1, File2, File3..] => 여러개의 파일을 업로드 할 경우
       e.target.files = [File1] => 하나의 파일만 업로드 할 경우
       */
      //   console.log(e.target.files)

      // e.target.files가 있으면 첫번째 파일 객체만 가져온다.
      const file = e.target.files && e.target.files[0]
      if (!file) return // 파일이 없는 경우는 함수 종료
      setImgFile(file) // 업로드한 파일 객체를 state에 저장

      // 이미지 파일 미리보기
      // FileReader() 객체는 파일을 비동기적으로 읽을 수 있도록 도와주는 객체 -> 이미지 미리보기 or 텍스트 파일 읽기 등에 주로 사용
      const reader = new FileReader()
      reader.readAsDataURL(file) // 업로드한 파일을 Base64 URL로 인코딩

      // onload(): 파일을 성공적으로 읽은 후에 실행되는 함수
      reader.onload = (event) => {
         //  console.log(event.target.result)
         setImgUrl(event.target.result) // Base64 URL을 imgUrl state에 저장
      }
   }

   // 작성한 내용 전송
   const handleSubmit = (e) => {
      e.preventDefault()

      if (!content.trim()) {
         alert('내용을 입력하세요.')
         return
      }

      if (!hashtags.trim()) {
         alert('해시태그를 입력하세요.')
         return
      }

      if (!imgFile) {
         alert('이미지 파일을 추가하세요.')
         return
      }

      // ★ 데이터는 formData 객체에 담겨 서버에 전송된다
      const formData = new FormData() // 폼 데이터를 쉽게 생성하고 전송할 수 있도록 하는 객체

      // append(name, 값): 전송할 값들을 저장
      formData.append('content', content) // 게시물 내용
      formData.append('hashtags', hashtags) // 해시태그

      // 파일명 인코딩(한글 파일명 깨짐 방지)
      const encodedFile = new File([imgFile], encodeURIComponent(imgFile.name), { type: imgFile.type })
      formData.append('img', encodedFile) // 이미지 파일 추가

      onPostCreate(formData) // 게시물 등록

      //   console.log('formData:', formData)

      //   formData.forEach((value, key) => {
      //      console.log(key, value)
      //   })
   }

   return (
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }} encType="multipart/form-data">
         {/* 이미지 업로드 필드 */}
         <Button variant="contained" component="label">
            이미지 업로드
            <input type="file" name="img" accept="image/*" hidden onChange={handleImageChange} />
         </Button>

         {imgUrl && (
            <Box mt={2}>
               <img src={imgUrl} alt="업로드 이미지 미리보기" style={{ width: '400px' }} />
            </Box>
         )}

         {/* 게시물 내용 입력 필드 */}
         <TextField label="게시물 내용" variant="outlined" fullWidth multiline rows={4} value={content} onChange={(e) => setContent(e.target.value)} sx={{ mt: 2 }} />

         {/* 해시태그 입력 필드 */}
         <TextField label="해시태그 (# 구분)" variant="outlined" fullWidth value={hashtags} onChange={(e) => setHashtags(e.target.value)} placeholder="예: #여행 #음식 #일상" sx={{ mt: 2 }} />

         <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
            등록하기
         </Button>
      </Box>
   )
}

export default PostCreateForm
