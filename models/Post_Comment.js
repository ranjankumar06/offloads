const sequelize = require("../utlis/database");
const { Sequelize, DataTypes } = require("sequelize");

const postcomments = sequelize.define("PostComment", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: true,
    primaryKey: true,
    autoIncrement: true,
  },
  Comment_Text: {
    type: Sequelize.STRING,
    defaultValue: "",
  },
  User_id: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
});

postcomments.getAllpostcomment = async function (posttableId) {
  return sequelize.query(
    'SELECT users."id" As "userId",users."firstName",users."ProfilePic",users."lastName",users."createdAt",users."updatedAt","PostComments"."Comment_Text","PostComments"."posttableId","PostComments"."id" As "commentId" FROM "PostComments" INNER JOIN "users" ON "PostComments"."User_id"="users".id where "PostComments"."posttableId"=:posttableId order by "PostComments"."createdAt" desc',
    {
      replacements: {
        posttableId: posttableId,
      },
      type: sequelize.QueryTypes.SELECT,
    }
  );
};

module.exports = postcomments;
