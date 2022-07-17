const sequelize = require("../utlis/database");
const { Sequelize, DataTypes } = require("sequelize");

const Friends = sequelize.define("friends", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: true,
    primaryKey: true,
    autoIncrement: true,
  },
  userId_1: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  userId_2: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  status: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
});
module.exports = Friends;
