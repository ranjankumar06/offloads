const sequelize = require("../utlis/database");
const { Sequelize, DataTypes } = require("sequelize");

const PostTables = sequelize.define("posttable", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: true,
    primaryKey: true,
    autoIncrement: true,
  },
  files:{
    type: Sequelize.JSONB,
    defaultValue: [],
  },
  title: {
    type: Sequelize.STRING,
    defaultValue: "",
  },
  description: {
    type: Sequelize.STRING(1000),
    defaultValue: "",
  },
  groupid:{
    type:Sequelize.INTEGER,
    defaultValue:0
  }
});

PostTables.getAllpost11 = async function () {
  return sequelize.query(
    'SELECT "posttables"."id","posttables"."title","posttables"."description","posttables"."createdAt","posttables"."updatedAt","users"."firstName", "users"."lastName" FROM "posttables" INNER JOIN "users" ON "posttables"."userId" = "users".id',
    {
      type: sequelize.QueryTypes.SELECT,
    }
  );
};

module.exports = PostTables;
