const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { Board, Member } = require('../models')
const { isLoggedIn } = require('./middlewares')

// uploads 폴더가 없을 경우 폴더 생성
try {
   fs.readdirSync('uploads') // 해당 폴더가 있는지 확인
} catch (error) {
   console.log('uploads 폴더가 없어 uploads 폴더를 생성합니다.')
   fs.mkdirSync('uploads') // 폴더 생성
}

// 이미지 업로드를 위한 multer 설정
const upload = multer({
   // 저장할 위치와 파일명 지정
   storage: multer.diskStorage({
      destination(req, file, cb) {
         cb(null, 'uploads/') // uploads 폴더에 파일 저장
      },
      filename(req, file, cb) {
         // 제주도.jpg
         const decodeFileName = decodeURIComponent(file.originalname) // 파일명 디코딩(한글 파일명 깨짐 방지)
         const ext = path.extname(decodeFileName) // 확장자 추출 -> .jpg
         const basename = path.basename(decodeFileName, ext) // 확장자 제거한 파일명 추출 -> 제주도

         // 파일명: 기존이름 + 업로드 날짜시간 + 확장자
         // 제주도.jpg
         // 제주도 + 1211242432 + .jpg
         // 제주도1211242432.jpg
         cb(null, basename + Date.now() + ext)
      },
   }),
   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 파일크기 제한
})

// 게시물 등록 localhost:8000/post
// <input type='file' name='img'>
router.post('/', isLoggedIn, upload.single('img'), async (req, res, next) => {
   try {
      console.log('파일정보:', req.file)
      console.log('formData:', req.body)

      // 업로드 된 파일이 없을경우
      if (!req.file) {
         const error = new Error('파일 업로드에 실패했습니다.')
         error.status = 400
         return next(error)
      }

      // 게시물 등록
      // board 테이블에 insert
      const board = await Board.create({
         content: req.body.content, // 게시물 내용
         img: `/${req.file.filename}`, // 이미지 url(파일명) => /제주도1211242432.jpg
         member_id: req.member.id, // 작성자 id(PK)
      })

      res.status(200).json({
         success: true,
         post: {
            id: board.id,
            content: board.content,
            img: board.img,
            userId: board.member_id,
         },
         message: '게시물이 성공적으로 등록되었습니다.',
      })
   } catch (error) {
      error.status = 500
      error.message = '게시물 등록 중 오류가 발생했습니다.'
      next(error)
   }
})

// 게시물 수정 localhost:8000/post/:id
router.put('/:id', isLoggedIn, upload.single('img'), async (req, res, next) => {
   try {
      // 1. 게시물 존재 여부 확인
      // select * from posts where id = ? and user_id = ? limit 1
      const board = await Board.findOne({
         where: { id: req.params.id, member_id: req.member.id },
      })

      // 게시물이 존재하지 않는다면
      if (!board) {
         const error = new Error('게시물을 찾을 수 없습니다.')
         error.status = 404
         return next(error)
      }

      // board 테이블 수정
      await board.update({
         content: req.body.content,
         img: req.file ? `/${req.file.filename}` : board.img, // 수정된 이미지가 있으면 바꿈
      })

      // 수정한 게시물 다시 조회(선택사항)
      const updatedBoard = await Board.findOne({
         where: { id: req.params.id },
         include: [
            {
               model: Member,
               attributes: ['id', 'name'], //user테이블의 id, name 컬럼 값만 가져옴
            },
         ],
      })

      res.status(200).json({
         success: true,
         post: updatedBoard,
         message: '게시물이 성공적으로 수정되었습니다.',
      })
   } catch (error) {
      error.status = 500
      error.message = '게시물 수정 중 오류가 발생했습니다.'
      next(error)
   }
})

// 특정 게시물 불러오기(id로 게시물 조회) localhost:8000/post/:id
router.get('/:id', async (req, res, next) => {
   try {
      const board = await Board.findOne({
         where: { id: req.params.id },
         include: [
            {
               model: Member,
               attributes: ['id', 'name'],
            },
         ],
      })

      // 게시물을 가져오지 못했을때
      if (!board) {
         const error = new Error('게시물을 찾을 수 없습니다.')
         error.status = 404
         return next(error)
      }

      res.status(200).json({
         success: true,
         board,
         message: '게시물을 성공적으로 불러왔습니다.',
      })
   } catch (error) {
      error.status = 500
      error.message = '특정 게시물을 불러오는 중 오류가 발생했습니다.'
      next(error)
   }
})

// 전체 게시물 불러오기(페이징 기능) localhost:8000/post?page=1
router.get('/', async (req, res, next) => {
   try {
      const page = parseInt(req.query.page, 10) || 1 // page 번호(기본값 1)
      // parseInt('08', 10) -> 10진수 8을 반환
      const limit = parseInt(req.query.limit, 10) || 30 // 한페이지당 나타낼 게시물 갯수(기본값 30)
      const offset = (page - 1) * limit // 오프셋 계산

      // 1. 게시물 레코드의 전체 갯수 가져오기
      const count = await Board.count()

      /*
      page:1, limit:3, offset:0 -> 0개의 레코드를 건너띄고 3개의 최신 레코드를 가져온다
      select * from posts order by createdAt desc limit 3 offset 0
      
      page:2, limit:3, offset:3 -> 3개의 레코드를 건너띄고 4번째부터 3개의 최신 레코드를 가져온다
      select * from posts order by createdAt desc limit 3 offset 3

      page:3, limit:3, offset:6 -> 6개의 레코드를 건너띄고 7번째부터 3개의 최신 레코드를 가져온다
      select * from posts order by createdAt desc limit 3 offset 6
      */
      // 2. 게시물 레코드 가져오기
      const boards = await Board.findAll({
         limit,
         offset,
         order: [['createdAt', 'DESC']], // 게시물을 최근 날짜 순으로 가져온다
         // 게시글 작성한 사람과 게시글에 작성된 해시태그를 같이 가져온다
         include: [
            {
               model: Member,
               attributes: ['id', 'name', 'email'],
            },
         ],
      })

      console.log('boards: ', boards)

      res.status(200).json({
         success: true,
         boards,
         pagination: {
            totalPosts: count, // 전체 게시물 수
            currentPage: page, // 현재 페이지
            totalPages: Math.ceil(count / limit), // 총 페이지 수
            limit, // 페이지당 게시물 수
         },
         message: '전체 게시물 리스트를 성공적으로 불러왔습니다.',
      })
   } catch (error) {
      error.status = 500
      error.message = '게시물 리스트를 불러오는 중 오류가 발생했습니다.'
      next(error)
   }
})

// 게시물 삭제 localhost:8000/post/:id
router.delete('/:id', isLoggedIn, async (req, res, next) => {
   try {
      // 1. 삭제할 게시물 존재 여부 확인
      // select * from posts where id = ? and user_id = ? limit 1
      const board = await Board.findOne({
         where: { id: req.params.id, member_id: req.user.id },
      })

      if (!board) {
         const error = new Error('게시물을 찾을 수 없습니다.')
         error.status = 404
         return next(error)
      }

      // 2. 게시물 삭제
      await board.destroy()

      res.status(200).json({
         success: true,
         message: '게시물이 성공적으로 삭제되었습니다.',
      })
   } catch (error) {
      error.status = 500
      error.message = '게시물 삭제 중 오류가 발생했습니다.'
      next(error)
   }
})

module.exports = router
