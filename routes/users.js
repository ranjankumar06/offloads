const multer = require("multer");
const express = require("express");
var router = express.Router();
var usercontroller = require("../controllers/user");
var isAuth = require("../middleware/auth");
var fileUploader = require("../middleware/fileUploader");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.put(
  "/updateprofile",
  [isAuth],
  fileUploader,
  usercontroller.updateProfile
);

router.get("/getUserdata", [isAuth], usercontroller.getAllData);

router.post("/register", usercontroller.register);

router.post("/friend", [isAuth], usercontroller.friend);

router.delete("/deleteFriend", [isAuth], usercontroller.deletefriend);

// router.post("/createGroup", fileUploader, [isAuth], usercontroller.creatGroup);

router.delete("/deleteGroup", [isAuth], usercontroller.deleteGroup);
router.put("/updategroup", [isAuth], fileUploader, usercontroller.updategroup);

router.post("/groupMember", [isAuth], usercontroller.groupMember);

router.put("/updateFriend", [isAuth], usercontroller.updateFriend);

router.get("/getFrienddata", [isAuth], usercontroller.getAllFriend);

router.get("/getOneUser", [isAuth], usercontroller.findUser);

router.get("/getfilteruser", [isAuth], usercontroller.getfilteruser);

router.get("/getuserFriend", [isAuth], usercontroller.getuserFriend);

// router.post('/friend11',[isAuth],usercontroller.friend11)

router.get("/getuserFriendreq", [isAuth], usercontroller.getuserFriendreq);

router.get(
  "/getuserFriendreqStatus",
  [isAuth],
  usercontroller.getuserFriendreqStatus
);

router.put("/updateFriendReq", [isAuth], usercontroller.updateFriendReq);

router.delete("/deleteFriendReq", [isAuth], usercontroller.deleteFriendReq);

router.get("/FriendreqStatus", [isAuth], usercontroller.FriendreqStatus);

router.post("/suggestionfriend", [isAuth], usercontroller.suggestionfriend);

router.get(
  "/getAllSuggestionFriend",
  [isAuth],
  usercontroller.getAllSuggestionFriend
);

// router.post("/postTable", [isAuth], usercontroller.postTable);

router.put("/UpdatePostTable", [isAuth], usercontroller.UpdatePostTable);

router.get("/getAllPost", [isAuth], usercontroller.getAllPost);

router.post("/postcomment", [isAuth], usercontroller.postcomment);

router.delete("/deletePostComment", [isAuth], usercontroller.deletePostComment);

router.get("/getallpostcomments", [isAuth], usercontroller.getAllPostComments);

router.put("/UpdatePostComments", [isAuth], usercontroller.UpdatePostComments);

router.get("/getallpost11", [isAuth], usercontroller.getallpost);

router.delete("/deletePost", [isAuth], usercontroller.deletePost);

router.post("/PostLike", [isAuth], usercontroller.PostLike);

router.delete("/deletePostLike", [isAuth], usercontroller.deletePostLike);

router.get("/getallpostcomment", [isAuth], usercontroller.getallpostcomment);

router.get("/getAllPostnew", [isAuth], usercontroller.getAllPostnew);

router.get("/getalluserpostlike", [isAuth], usercontroller.getalluserpostlike);

router.get("/getAllPostnew11", [isAuth], usercontroller.getAllPostnew11);

router.get("/getallgroups", [isAuth], usercontroller.getallgroups);

router.get("/getOnegroup", [isAuth], usercontroller.getOnegroup);

router.get("/getOnepost", [isAuth], usercontroller.getOnepost);

router.get("/getallgroupmember", [isAuth], usercontroller.getallgroupmember);

router.delete("/deletegroupmember", [isAuth], usercontroller.deletegroupmember);

router.post(
  "/creatGrouporGroupMember",
  [isAuth],
  fileUploader,
  usercontroller.creatGrouporGroupMember
);

router.get("/joinedgroupmember", [isAuth], usercontroller.joinedgroupmember);

router.get(
  "/joinedgroupmember11",
  [isAuth],
  usercontroller.joinedgroupmember11
);

router.get(
  "/joinedgroupmembercount",
  [isAuth],
  usercontroller.joinedgroupmembercount
);

router.get(
  "/joinedgroupmembercount13",
  [isAuth],
  usercontroller.joinedgroupmembercount13
);

router.put(
  "/updateprofilenew",
  [isAuth],
  fileUploader,
  usercontroller.updateprofilenew
);

router.get("/getallgroupmember1", [isAuth], usercontroller.getallgroupmember1);

// router.get("/getallgroupmember12", [isAuth], usercontroller.getallgroupmember12);

router.get("/getmember", [isAuth], usercontroller.getmember);

router.post(
  "/updategroupImage",
  [isAuth],
  fileUploader,
  usercontroller.updategroupImage
);

router.post(
  "/updateCommunityPost",
  [isAuth],
  fileUploader,
  usercontroller.updateCommunityPost
);

router.post("/createChate", [isAuth], usercontroller.createChate);

router.get("/findchat", [isAuth], usercontroller.findchat);

router.get("/findallchat", [isAuth], usercontroller.findallchat);

router.get("/getAllchatuser", [isAuth], usercontroller.getAllchatuser);

router.post("/verifyOtp", [isAuth], usercontroller.verifyOtp);

router.put("/resendOtp", [isAuth], usercontroller.resendOtp);

router.post(
  "/sendPhotoInChat",
  [isAuth],
  fileUploader,
  usercontroller.sendPhotoInChat
);


router.post(
  "/postPostedByGroup",
  [isAuth],
  fileUploader,
  usercontroller.postPostedByGroup
);

router.get("/getAllgroupPost", [isAuth], usercontroller.getAllgroupPost);

// router.put(
//   "/UpdateCommunityPost",
//   [isAuth],
//   fileUploader,
//   usercontroller.UpdateCommunityPost
// );

router.post("/blockuser", [isAuth], usercontroller.blockuser);

router.get("/getOneFriend", [isAuth], usercontroller.getOneFriend);

router.get("/getAllFriend1", [isAuth], usercontroller.getAllFriend1);

router.get("/getSuggestionfriend", [isAuth], usercontroller.getSuggestionfriend);



module.exports = router;
