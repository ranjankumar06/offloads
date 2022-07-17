const sequelize = require("../utlis/database");
const { Sequelize, DataTypes } = require("sequelize");

const User = sequelize.define("users", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  firstName: {
    type: Sequelize.STRING,
    defaultValue: "",
  },
  lastName: {
    type: Sequelize.STRING,
    defaultValue: "",
  },
  email: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
  },
  phoneNumber: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
  },
  ProfilePic: {
    type: Sequelize.JSONB,
    defaultValue: [],
  },
  Uid: {
    type: Sequelize.STRING,
    defaultValue: "",
  },
  Type: {
    type: Sequelize.STRING, // "mobileNumber" , "gmail" , "manual"
    defaultValue: "",
  },
  DescribeYourself:{
    type:Sequelize.STRING,
    defaultValue:""
  },
  ShareLocation:{
    type:Sequelize.STRING,
    defaultValue:""
  },
  UserOtp:{
    type:Sequelize.STRING,
    defaultValue:""
  },
  Gender:{
    type:Sequelize.STRING,
    defaultValue:""
  }
});

module.exports = User;

