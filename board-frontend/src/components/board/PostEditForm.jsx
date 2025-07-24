import { TextField, Button, Box } from '@mui/material'
import { useState } from 'react'

function PostEditForm({ onPostEdit, initialValues = {} }) {
   /*
    특정 게시물 데이터(post)
    initialValues = {
         id: 1,
         content: '안녕하세요', 
         img: '/dog11111344242.jpg',
         createAt: 2024-10-10 02:10:10,
         updateAt:  2024-10-10 02:10:10,
         User: {...},
         Hashtags: [
             {title: '여행', PostHashtag: {..}},
             {title: '맛집', PostHashtag: {..}},
             {title: '스위스', PostHashtag: {..}},
         ]
         
         => #여행 #맛집 #스위스
    }
   */

   const [imgUrl, setImgUrl] = useState(import.meta.env.VITE_APP_API_URL + initialValues.img) // 이미지 경로(파일명 포함)
   const [imgFile, setImgFile] = useState(null) // 이미지 파일 객체
   const [content, setContent] = useState(initialValues.content) // 게시물 내용

   /*
   Hashtags: [
             {title: '여행', PostHashtag: {..}},
             {title: '맛집', PostHashtag: {..}},
             {title: '스위스', PostHashtag: {..}},
         ]
   
   */
   const [hashtags, setHashtags] = useState(initialValues.Hashtags.map((tag) => `#${tag.title}`).join(' ')) // 해시태그 문자열을 만들어줌

   // ['#여행', '#맛집', '#스위스'] => '#여행 #맛집 #스위스'

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

      // 수정시 이미지 파일을 바꾸지 않는 경우도 있으므로 이미지 파일 체크 사용 X
      // if (!imgFile) {
      //    alert('이미지 파일을 추가하세요.')
      //    return
      // }

      // ★ 데이터는 formData 객체에 담겨 서버에 전송된다
      const formData = new FormData() // 폼 데이터를 쉽게 생성하고 전송할 수 있도록 하는 객체

      // append(name, 값): 전송할 값들을 저장
      formData.append('content', content) // 게시물 내용
      formData.append('hashtags', hashtags) // 해시태그

      // 이미지를 수정한 경우엔 imgFile에 이미지 객체가 있으므로, 아래와 같이 이미지를 수정한 경우에만 formData에 수정한 이미지 파일을 추가하도록 한다 -> 이미지를 수정하지 않았다면 이미지 파일을 서버에 보내지 않아도 된다
      if (imgFile) {
         // 파일명 인코딩(한글 파일명 깨짐 방지)
         const encodedFile = new File([imgFile], encodeURIComponent(imgFile.name), { type: imgFile.type })
         formData.append('img', encodedFile) // 이미지 파일 추가
      }

      onPostEdit(formData) // 게시물 수정
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
            수정하기
         </Button>
      </Box>
   )
}

export default PostEditForm
