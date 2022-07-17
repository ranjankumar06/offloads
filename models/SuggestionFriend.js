const sequelize = require("../utlis/database");
const { Sequelize, DataTypes } = require("sequelize");

const SuggestionFriend = sequelize.define("suggestionfriend", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  Usersid: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  NotSuggestionFriend: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    defaultValue: [],
    allowNull: true,
  },
});

module.exports = SuggestionFriend;
