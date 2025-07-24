import { Container } from '@mui/material'
import PostEditForm from '../components/board/PostEditForm'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPostByIdThunk, updatePostThunk } from '../features/boardSlice'

function PostEditPage() {
   const navigate = useNavigate()
   const dispatch = useDispatch()
   const { id } = useParams() // post의 id를 path 파라메터에서 가져온다
   const { post, loading } = useSelector((state) => state.posts)

   // 게시물 데이터 불러오기
   useEffect(() => {
      dispatch(fetchPostByIdThunk(id))
   }, [dispatch, id])

   // 게시물 수정
   const onPostEdit = (postData) => {
      dispatch(updatePostThunk({ id, postData }))
         .unwrap()
         .then(() => {
            navigate('/') //게시물 수정 후 메인페이지로 이동
         })
         .catch((error) => {
            console.error('게시물 수정 중 오류 발생:', error)
            alert('게시물 수정에 실패했습니다. ' + error)
         })
   }

   if (loading) return <p>로딩 중...</p>

   return (
      <Container maxWidth="md">
         <h1>게시물 수정</h1>
         {post && <PostEditForm onPostEdit={onPostEdit} initialValues={post} />}
      </Container>
   )
}

export default PostEditPage
