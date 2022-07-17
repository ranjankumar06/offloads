const sequelize=require('../utlis/database')
const {Sequelize,DataTypes}=require('sequelize')

const Block=sequelize.define("Block",{
    id:{
        type:Sequelize.INTEGER,
        allowNull:true,
        primaryKey:true,
        autoIncrement:true
    },
    USERID_1:{
        type:Sequelize.INTEGER,
        defaultValue:0
    },
    USERID_2:{
        type:Sequelize.INTEGER,
        defaultValue:0
    }
})

module.exports=Block