const Sequelize = require('sequelize')

module.exports = class Member extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            email: {
               //ERD이메일
               type: Sequelize.STRING(40),
               allowNull: false,
               unique: true,
            },
            name: {
               //ERD이름
               type: Sequelize.STRING(50),
               allowNull: false,
            },
            password: {
               //ERD비밀번호
               type: Sequelize.STRING(100),
               allowNull: false,
            },
         },
         {
            sequelize,
            timestamps: true, //createAt, updateAt 자동 생성
            underscored: false,
            modelName: 'Member',
            tableName: 'members',
            paranoid: true, // deleteAt 자동생성, 소프트 삭제
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }
   static associate(db) {
      db.Member.hasMany(db.Board, {
         foreignKey: 'member_id',
         sourceKey: 'id',
      })
   }
}
