const sequelize=require("../utlis/database")
const {Sequelize,DataTypes}=require("sequelize");

const chatconnection=sequelize.define("Chatconnection",{
    id:{
        type:Sequelize.INTEGER,
        allowNull:true,
        primaryKey: true,
        autoIncrement:true,
    },
    userid_1:{
        type:Sequelize.INTEGER,
        defaultValue:0
    },
    userid_2:{
        type:Sequelize.INTEGER,
        defaultValue:0
    },
    Token_1:{
        type:Sequelize.STRING,
        defaultValue:0
    },
    Token_2:{
        type:Sequelize.STRING,
        defaultValue:0
    }
})

module.exports=chatconnection