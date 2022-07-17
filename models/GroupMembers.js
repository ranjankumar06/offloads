const sequelize = require("../utlis/database");
const { Sequelize, DataTypes } = require("sequelize");

const GroupMembers = sequelize.define("groupmembers", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  UserId: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  status: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
});
module.exports = GroupMembers;
