const sequelize = require("../utlis/database");
const { Sequelize, DataTypes } = require("sequelize");

const postlike = sequelize.define("PostLike", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: true,
    autoIncrement: true,
    primaryKey: true,
  },
  UserId: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
});

module.exports = postlike;
