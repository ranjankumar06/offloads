var createError = require("http-errors");
const dotenv = require("dotenv").config({ path: "/opt/offloads/.env" });
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const sequelize = require("./utlis/database");
const AwsS3 = require("./utlis/aws-s3");
var app = express();
let cors = require("cors");


// // use it before all route definitions

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors(corsOptions));

// router
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

// Module
var User = require("./models/User");
const Friends = require("./models/friends");
const Group = require("./models/Group");
const GroupMembers = require("./models/GroupMembers");
const PostTables = require("./models/Post");
const postcomments = require("./models/Post_Comment");
const suggestionfriend = require("./models/SuggestionFriend");
const postlike = require("./models/PostLikes");
const chat = require("./models/chat");
const chatconnection = require("./models/ChatConnection");
const Block=require("./models/Block")
// user router
app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// relation with tables
PostTables.hasMany(postlike);
User.hasMany(PostTables);
PostTables.hasMany(postcomments);
Group.hasMany(GroupMembers);
chatconnection.hasMany(chat);

// sequelize.sync({ alter: true })
//   .then((result) => {
//     console.log(result);
//   }).catch((err) => {
//     console.log(err);
//   })


module.exports = app;
