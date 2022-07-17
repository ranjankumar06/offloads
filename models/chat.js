const sequelize=require("../utlis/database")
const {Sequelize,DataTypes}=require("sequelize")

const chat=sequelize.define("Chat",{
    id:{
        type:Sequelize.INTEGER,
        allowNull:true,
        primaryKey: true,
        autoIncrement:true,
    },
    senderid:{
        type:Sequelize.INTEGER,
        defaultValue:0
    },
    reciverid:{
        type:Sequelize.INTEGER,
        defaultValue:0
    },
    Text:{
        type:Sequelize.STRING,
        defaultValue:""
    },
    Attachment:{
        type: Sequelize.JSONB,
        defaultValue:[],
    }
})

module.exports=chat