// 1. 필요한 모듈과 설정 불러오기
const Sequelize = require('sequelize')
const env = process.env.NODE_ENV || 'development'
//현재 환경이 'development'임을 확인
const config = require('../config/config')[env]
//config.json에서 'development' 설정 가져오기

// 2. 모델 파일들(설계도) 불러오기
const Member = require('./member')
const Board = require('./board')

const db = {}
//모든 모델과 연결 정보를 담을 빈 객체

// 3.config 정보를 바탕으로 실제 DB와 연결(Sequelize 인스턴스 생성)
const sequelize = new Sequelize(config.database, config.membername, config.password, config)

// 4.db 객체에 모델과 연결 정보 담기
db.sequelize = sequelize
db.Member = Member
db.Board = Board

// 5. 각 모델의 init 메서드를 호출하여 테이블 스키마 초기화(설계도대로 테이블 구성)
Member.init(sequelize)
Board.init(sequelize)

// 6. 각 모델의 associate 메서드를 호출하여 관계 설정(테이블끼리 연결)
Member.associate(db)
Board.associate(db)

// 7. 설정이 완료된 db 객체를 다른 파일에서 쓸 수 있도록 내보냄
module.exports = db
