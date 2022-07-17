const sequelize = require("../utlis/database");
const { Sequelize, DataTypes } = require("sequelize");

const Group = sequelize.define("group", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  groupname: {
    type: Sequelize.STRING,
    defaultValue: "",
  },
  description: {
    type: Sequelize.STRING,
    defaultValue: "",
  },
  groupimage: {
    type: Sequelize.JSONB,
    defaultValue: [],
  },
  status: {
    type: Sequelize.INTEGER,
    defaultValue: 1,
  },
  userid: {
    type: Sequelize.INTEGER,
    defaultValue: null,
  },
});



module.exports = Group;
