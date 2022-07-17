const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
var admin = require("firebase-admin");
const { Op } = require("sequelize");
const Friends = require("../models/friends");
const Group = require("../models/Group");
const GroupMembers = require("../models/GroupMembers");
var serviceAccount = require("../config/config.json");
const SuggestionFriend = require("../models/SuggestionFriend");
const PostTables = require("../models/Post");
const postcomments = require("../models/Post_Comment");
const postlike = require("../models/PostLikes");
const AwsS3 = require("../utlis/aws-s3");
const chatconnection = require("../models/ChatConnection");
const chat = require("../models/chat");
const Block = require("../models/Block");

var AWS = require("aws-sdk");

AWS.config.update({
  region: "eu-west-2",
  accessKeyId: "AKIARVMGJYNWHG5RPHNF",
  secretAccessKey: "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",
});
var sns = new AWS.SNS();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "",
});

exports.register = async (req, res, next) => {
  try {
    const { phoneNumber, email, token, Type, firstName, lastName } = req.body;
    if (Type === "gmail" || Type === "manual") {
      admin
        .auth()
        .verifyIdToken(token)
        .then(async (decodedToken) => {
          let uid = decodedToken?.uid;
          const checkExist = await User.findOne({
            where: {
              [Op.or]: [{ phoneNumber: phoneNumber }, { email: email }],
            },
            order: [["createdAt", "desc"]],
          });
          if (checkExist) {
            const Exist = await User.findOne({
              where: { phoneNumber: phoneNumber, email: "" },
              order: [["createdAt", "desc"]],
            });
            if (!Exist) {
              const token = jwt.sign(
                {
                  userId: checkExist.id,
                },
                process.env.JWT_SECRET,
                {
                  expiresIn: "10000h",
                }
              );
              return res.status(200).json({
                status: 1,
                message: "This data is  Already Exit",
                data: token,
              });
            }
          } else {
            const add = await User.create({
              Uid: uid,
              phoneNumber,
              email,
              Type,
              firstName,
              lastName,
            });
            if (add) {
              const token = jwt.sign(
                {
                  userId: add.id,
                },
                process.env.JWT_SECRET,
                {
                  expiresIn: "10000h",
                }
              );
              return res.status(200).json({
                status: 1,
                message: "User Register Successfully",
                data: token,
              });
            }
          }
        });
    }
    if (Type === "mobileNumber") {
      const checkExist = await User.findOne({
        where: {
          [Op.or]: [{ phoneNumber: phoneNumber }, { email: email }],
        },
        order: [["createdAt", "desc"]],
      });
      if (checkExist) {
        const Exist = await User.findOne({
          where: { phoneNumber: phoneNumber, email: "" },
          order: [["createdAt", "desc"]],
        });
        if (!Exist) {
          const token = jwt.sign(
            {
              userId: checkExist.id,
            },
            process.env.JWT_SECRET,
            {
              expiresIn: "10000h",
            }
          );
          let UserOtp = Math.floor(100000 + Math.random() * 900000);
          const currentOtp = await User.update(
            { UserOtp: UserOtp },
            {
              where: { phoneNumber: phoneNumber },
              order: [["createdAt", "desc"]],
            }
          );
          var params = {
            Message:
              "Your Offloads code is " +
              UserOtp +
              ". You can use this code to verify your account.",
            PhoneNumber: phoneNumber,
          };
          var publishTextPromise = new AWS.SNS({
            apiVersion: "2010-03-31",
          })
            .publish(params)
            .promise()
            .then(function (data) {
              console.log(data, "already");
            })
            .catch(function (err) {
              console.log(err, "fsdggssgsdgg");
            });
          return res.status(200).json({
            status: 1,
            message: "This data is  Already Exit",
            data: token,
            currentOtp: params,
          });
        }
      } else {
        let UserOtp = Math.floor(100000 + Math.random() * 900000);
        const add = await User.create({
          phoneNumber,
          email,
          Type,
          firstName,
          lastName,
          UserOtp: UserOtp,
        });
        var params = {
          Message:
            "Your Offloads code is " +
            UserOtp +
            ". You can use this code to verify your account.",
          PhoneNumber: phoneNumber,
        };
        var publishTextPromise = new AWS.SNS({
          apiVersion: "2010-03-31",
        })
          .publish(params)
          .promise()
          .then(function (data) {
            console.log(data, "new");
          })
          .catch(function (err) {
            console.log(err, "new");
          });
        if (add) {
          const token = jwt.sign(
            {
              userId: add.id,
            },
            process.env.JWT_SECRET,
            {
              expiresIn: "10000h",
            }
          );
          return res.status(200).json({
            status: 1,
            message: "User Register Successfully",
            data: token,
            params: params,
          });
        }
      }
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    const {
      firstName,
      lastName,
      DescribeYourself,
      ShareLocation,
      email,
      phoneNumber,
      Gender,
    } = req.body;
    const checkExist = await User.findOne({
      where: { id: req.userId },
      order: [["createdAt", "desc"]],
    });
    // console.log(checkExist);
    if (checkExist) {
      if (email) {
        checkExist.email = email;
      }
      if (Gender) {
        checkExist.Gender = Gender;
      }
      if (phoneNumber) {
        checkExist.phoneNumber = phoneNumber;
      }
      if (firstName) {
        checkExist.firstName = firstName;
      }
      if (DescribeYourself) {
        checkExist.DescribeYourself = DescribeYourself;
      }
      checkExist.ShareLocation = ShareLocation;
      checkExist.lastName = lastName;
      checkExist.save();
      return res.status(200).json({
        status: 1,
        message: "Profile Updated Successfully",
      });
    } else {
      return res.status(500).json({
        status: 0,
        message: "User not found",
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.getAllData = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    const getuser = await User.findAll({ order: [["createdAt", "desc"]] });
    if (getuser) {
      return res.status(200).json({
        status: 1,
        message: "Get user data successfully",
        getuser: getuser,
      });
    } else {
      return res.status(200).json({
        status: 0,
        message: "User data not found",
      });
    }
  } catch (e) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.friend = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }

    const { userId_2 } = req.body;
    const temp = await User.findOne({
      where: { id: userId_2 },
      order: [["createdAt", "desc"]],
    });
    if (!temp) {
      return res.status(400).json({
        status: 0,
        message: "User not available",
      });
    }

    const frd = await Friends.findOne({
      where: { userId_2: userId_2, userId_1: req.userId },
      order: [["createdAt", "desc"]],
    });
    if (frd) {
      return res.status(200).json({
        status: 1,
        message: "You Already sent friend request this User",
        frd: frd,
      });
    } else {
      const { userId_1, userId_2, status } = req.body;
      const userId = req.userId;
      const postfriend = await Friends.create({
        userId_1,
        userId_2,
        status,
        userId_1: userId,
      });
      if (postfriend) {
        return res.status(200).json({
          status: 1,
          message: "Friends details saved successfully",
        });
      } else {
        return res.status(500).json({
          status: 0,
          message: "Frend not post",
        });
      }
    }
  } catch (err) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.deletefriend = async (req, res, next) => {
  try {
    const { id } = req.body;
    const Updatefined = await Friends.destroy({
      where: {
        [Op.or]: [
          { [Op.and]: [{ userId_1: req.userId, userId_2: id }] },
          { [Op.and]: [{ userId_1: id, userId_2: req.userId }] },
        ],
      },
      order: [["createdAt", "desc"]],
    });
    if (Updatefined) {
      return res.status(200).json({
        status: 1,
        message: "Friends request deleted successfully",
      });
    } else {
      return res.status(200).json({
        status: 0,
        message: "This friend request is not found",
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

// exports.creatGroup = async (req, res, next) => {
//   try {
//     if (req.userId == undefined) {
//       return res.status(401).json({
//         status: 0,
//         message: "request not authorize.",
//       });
//     }
//     const { groupname, description, status } = req.body;
//     const group = await Group.create({
//       groupname,
//       description,
//       status,
//       // groupimage: imagename,
//       userid: req.userId,
//     });
//     if (group) {
//       return res.status(200).json({
//         status: 1,
//         message: "Group created successfully",
//       });
//     } else {
//       return res.status(200).json({
//         status: 0,
//         message: "something is missing",
//       });
//     }
//   } catch (err) {
//     return res.status(500).json({
//       status: 0,
//       message: "server error",
//     });
//   }
// };

exports.deleteGroup = async (req, res, next) => {
  try {
    const { id } = req.body;
    const delGroup = await Group.destroy({
      where: { id, userid: req.userId },
      order: [["createdAt", "desc"]],
    });
    if (delGroup) {
      return res.status(200).json({
        status: 1,
        message: "Group deleted successfully",
      });
    } else {
      return res.status(200).json({
        status: 0,
        message: "User Not found",
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: 0,
      message: "Something went wrong",
    });
  }
};

exports.updategroup = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    const { groupname, description, status, id, imagename } = req.body;
    const checkExist = await Group.findOne({
      where: { id, userid: req.userId },
      order: [["createdAt", "desc"]],
    });
    if (checkExist) {
      checkExist.groupname = groupname;
      checkExist.description = description;
      checkExist.status = status;
      checkExist.groupimage = imagename;
      checkExist.save();
      return res.status(200).json({
        status: 1,
        message: "Profile Updated Successfully",
      });
    } else {
      return res.status(500).json({
        status: 0,
        message: "User not found",
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.groupMember = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    const { groupId } = req.body;
    const temp = await Group.findOne({
      where: { id: groupId },
      order: [["createdAt", "desc"]],
    });
    if (!temp) {
      return res.status(400).json({
        status: 0,
        message: "This Groupid is not available",
      });
    }
    const findgroupid = await GroupMembers.findOne({
      where: { groupId, UserId: req.userId },
      order: [["createdAt", "desc"]],
    });
    if (findgroupid) {
      return res.status(200).json({
        status: 0,
        message: "This groupMember already in this group",
      });
    } else {
      const { status, groupId } = req.body;
      const postgroupMem = await GroupMembers.create({
        groupId,
        UserId: req.userId,
        status,
      });
      if (postgroupMem) {
        return res.status(200).json({
          status: 1,
          message: "GroupMembers details saved successfully",
        });
      } else {
        return res.status(500).json({
          status: 0,
          message: "Frend not post",
        });
      }
    }
  } catch (err) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.updateFriend = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    const { id } = req.body;
    const checkExist = await Friends.findOne({
      where: { id },
      order: [["createdAt", "desc"]],
    });
    if (checkExist) {
      checkExist.status = 1;
      checkExist.save();
      return res.status(200).json({
        status: 1,
        message: "Status Updated Successfully",
      });
    } else {
      return res.status(500).json({
        status: 0,
        message: "User not found",
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.getAllFriend = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    const getfriend = await Friends.findAll({ order: [["createdAt", "desc"]] });
    if (getfriend) {
      return res.status(200).json({
        status: 1,
        message: "Get user data successfully",
        getfriend: getfriend,
      });
    } else {
      return res.status(200).json({
        status: 0,
        message: "User data not found",
      });
    }
  } catch (e) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.findUser = async (req, res, next) => {
  try {
    const userfind = await User.findOne({
      where: { id: req.userId },
      order: [["createdAt", "desc"]],
    });
    if (userfind) {
      return res.status(200).json({
        status: 1,
        message: "User find successfully",
        userfind: userfind,
      });
    } else {
      return res.status(200).json({
        status: 0,
        message: "This user is not found",
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.getfilteruser = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    const getuser = await User.findAll({ order: [["createdAt", "desc"]] });
    // console.log(getuser);
    const prosDta = getuser.filter((userdata) => userdata.id !== req.userId);
    if (prosDta) {
      return res.status(200).json({
        status: 1,
        message: "Get user data successfully",
        getuser: prosDta,
      });
    } else {
      return res.status(200).json({
        status: 0,
        message: "User data not found",
      });
    }
  } catch (e) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.getuserFriend = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    const getuser = await Friends.findAll({
      where: { userId_1: req.userId },
      order: [["createdAt", "desc"]],
    });
    if (getuser) {
      return res.status(200).json({
        status: 1,
        message: "Get user data successfully",
        getuser: getuser,
      });
    } else {
      return res.status(200).json({
        status: 0,
        message: "User data not found",
      });
    }
  } catch (e) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

// exports.friend11 = async (req, res, next) => {
//   try {
//     if (req.userId == undefined) {
//       return res.status(401).json({
//         status: 0,
//         message: "request not authorize.",
//       });
//     }
//     const {userId_2}=req.body
//       const temp = await User.findOne({where:{id:userId_2}});
//       if (!temp) {
//         return res.status(400).json({
//           status: 0,
//           message: "User not available",
//         });
//       }

//     const frd = await Friends.findOne({
//       where: { userId_2: userId_2, userId_1: req.userId },
//     });
//     if (frd) {
//       return res.status(200).json({
//         status: 1,
//         message: "You Already sent friend request this User",
//         frd: frd,
//       });
//     } else {
//       const { userId_1, userId_2, status } = req.body;
//       const userId = req.userId;
//       const postfriend = await Friends.create({
//         userId_1,
//         userId_2,
//         status,
//         userId_1: userId,
//       });
//       if (postfriend) {
//         return res.status(200).json({
//           status: 1,
//           message: "Friends details saved successfully",
//         });
//       } else {
//         return res.status(500).json({
//           status: 0,
//           message: "Frend not post",
//         });
//       }
//     }
//   } catch (err) {
//     return res.status(500).json({
//       status: 0,
//       message: "something went wrong",
//     });
//   }
// };

exports.getuserFriendreq = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    let data = [];
    const getuser = await Friends.findAll({
      where: { userId_2: req.userId },
      order: [["createdAt", "desc"]],
    });
    for (let x of getuser) {
      const getuserdetails = await User.findOne({
        where: { id: x.userId_1 },
        order: [["createdAt", "desc"]],
      });
      if (x.status == 0) {
        data.push(getuserdetails);
      }
    }
    if (data) {
      return res.status(200).json({
        status: 1,
        message: "Get user data successfully",
        getuser: data,
      });
    } else {
      return res.status(200).json({
        status: 0,
        message: "User data not found",
      });
    }
  } catch (e) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.getuserFriendreqStatus = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    const statusfriend = await Friends.findAll({
      where: {
        [Op.or]: [
          { [Op.and]: [{ userId_1: req.userId }, { status: 1 }] },
          { [Op.and]: [{ userId_2: req.userId }, { status: 1 }] },
        ],
      },
      order: [["createdAt", "desc"]],
    });
    if (statusfriend) {
      return res.status(200).json({
        status: 1,
        message: "Get user data successfully",
        getuser: statusfriend,
      });
    } else {
      return res.status(200).json({
        status: 0,
        message: "User data not found",
      });
    }
  } catch (e) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.updateFriendReq = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    const { userId_1 } = req.body;
    const Updatefined = await Friends.findOne({
      where: { userId_1: userId_1, userId_2: req.userId },
      order: [["createdAt", "desc"]],
    });
    if (Updatefined) {
      Updatefined.status = 1;
      Updatefined.save();

      const exit = await chatconnection.findOne({
        where: {
          [Op.or]: [
            { [Op.and]: [{ userid_1: userId_1, userid_2: req.userId }] },
            { [Op.and]: [{ userid_1: req.userId, userid_2: userId_1 }] },
          ],
        },
        order: [["createdAt", "desc"]],
      });
      if (!exit) {
        const postgroupMem1 = await chatconnection.create({
          userid_1: userId_1,
          userid_2: req.userId,
        });
        if (postgroupMem1) {
          const uddattoken = await chatconnection.update(
            {
              Token_1:
                "" +
                postgroupMem1.userid_1 +
                postgroupMem1.id +
                postgroupMem1.userid_2,
              Token_2:
                "" +
                postgroupMem1.userid_2 +
                postgroupMem1.id +
                postgroupMem1.userid_1,
            },
            { where: { id: postgroupMem1.id }, order: [["createdAt", "desc"]] }
          );
        }
        return res.status(200).json({
          status: 1,
          message: "Status Updated Successfully",
        });
      } else {
        return res.status(200).json({
          status: 0,
          message: "Already exist",
        });
      }
    }
  } catch (err) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.deleteFriendReq = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    const { userId_1 } = req.body;
    const Updatefined = await Friends.destroy({
      where: { userId_1: userId_1, userId_2: req.userId },
      order: [["createdAt", "desc"]],
    });
    if (Updatefined) {
      return res.status(200).json({
        status: 1,
        message: "Entry Deleted Successfully",
      });
    } else {
      return res.status(500).json({
        status: 0,
        message: "User not found",
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.FriendreqStatus = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    const statusfriend = await Friends.findAll({
      where: {
        [Op.or]: [
          { [Op.and]: [{ userId_1: req.userId }, { status: 1 }] },
          { [Op.and]: [{ userId_2: req.userId }, { status: 1 }] },
        ],
      },
      order: [["createdAt", "desc"]],
    });
    let data = [];
    const userlist = statusfriend;
    for (let x of userlist) {
      if (x.userId_1 === req.userId) {
        let tempUser = await User.findOne({
          where: { id: x.userId_2 },
          order: [["createdAt", "desc"]],
        });
        data.push(tempUser);
      } else if (x.userId_2 === req.userId) {
        let tempUser2 = await User.findOne({
          where: { id: x.userId_1 },
          order: [["createdAt", "desc"]],
        });
        data.push(tempUser2);
      }
    }
    const finalUserList = [
      ...new Map(data.map((item) => [item["email"], item])).values(),
    ];
    if (finalUserList) {
      return res.status(200).json({
        status: 1,
        message: "Get user data successfully",
        getuser: finalUserList,
      });
    } else {
      return res.status(200).json({
        status: 0,
        message: "User data not found",
      });
    }
  } catch (e) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

// exports.deleteFriendReq = async (req, res, next) => {
//   try {
//     if (req.userId == undefined) {
//       return res.status(401).json({
//         status: 0,
//         message: "request not authorize.",
//       });
//     }
//     const { id } = req.body;
//     const Updatefined = await Friends.destroy({
//       where: {
//         [Op.or]: [
//           { [Op.and]: [{ userId_1:req.userId ,userId_2:id}]},
//           { [Op.and]: [{ userId_1:id,userId_2: req.userId}]},
//         ],
//       },
//     });
//     if (Updatefined) {
//       return res.status(200).json({
//         status: 1,
//         message: "Entry Deleted Successfully",
//       });
//     } else {
//       return res.status(200).json({
//         status: 0,
//         message: "User not found",
//       });
//     }
//   } catch (err) {
//     return res.status(500).json({
//       status: 0,
//       message: "something went wrong",
//     });
//   }
// };

// exports.suggestionfriend = async (req, res, next) => {
//   try {
//     if (req.userId == undefined) {
//       return res.status(401).json({
//         status: 0,
//         message: "request not authorize.",
//       });
//     }
//     const {NotSuggestionFriend} = req.body;
//     const suggestion = await SuggestionFriend.create({ NotSuggestionFriend, Usersid:req.userId});
//     if (suggestion) {
//       return res.status(200).json({
//         status: 1,
//         message: "suggestion created successfully",
//       });
//     } else {
//       return res.status(200).json({
//         status: 0,
//         message: "something is missing",
//       });
//     }
//   } catch (err) {
//     return res.status(500).json({
//       status: 0,
//       message: "server error",
//     });
//   }
// };

exports.suggestionfriend = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    const users = await SuggestionFriend.findOne({
      where: { Usersid: req.userId },
      order: [["createdAt", "desc"]],
    });
    if (users) {
      const { num } = req.body;
      let arr = users.NotSuggestionFriend;
      if (!arr.includes(num)) {
        arr.push(num);
      } else {
        return res.status(200).json({
          status: 1,
          message: "data already exist",
        });
      }

      const result = await SuggestionFriend.update(
        { NotSuggestionFriend: arr },
        { where: { Usersid: req.userId }, order: [["createdAt", "desc"]] }
      );
      return res.status(200).json({
        status: 1,
        message: "data saved",
      });
    } else {
      const { num } = req.body;
      let arry2 = [];
      arry2.push(num);
      const suggFriend = await SuggestionFriend.create({
        Usersid: req.userId,
        NotSuggestionFriend: arry2,
      });

      if (suggFriend) {
        return res.status(200).json({
          status: 1,
          message: "Friends details saved successfully",
        });
      } else {
        return res.status(500).json({
          status: 0,
          message: "Friend not post",
        });
      }
    }
  } catch (err) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.getAllSuggestionFriend = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    const getsuggestion = await SuggestionFriend.findAll({
      where: { Usersid: req.userId },
      order: [["createdAt", "desc"]],
    });
    if (getsuggestion) {
      return res.status(200).json({
        status: 1,
        message: "Get user data successfully",
        getfriend: getsuggestion,
      });
    } else {
      return res.status(200).json({
        status: 0,
        message: "User data not found",
      });
    }
  } catch (e) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

// exports.postTable = async (req, res, next) => {
//   try {
//     if (req.userId == undefined) {
//       return res.status(401).json({
//         status: 0,
//         message: "request not authorize.",
//       });
//     }
//     const { description, title,files } = req.body;
//     const postItems = await PostTables.create({
//       description,
//       title,
//       files,
//       userId: req.userId,
//     });
//     if (postItems) {
//       return res.status(200).json({
//         status: 1,
//         message: "Post successfully",
//         postItem: postItems,
//       });
//     } else {
//       return res.status(200).json({
//         status: 0,
//         message: "something is missing",
//       });
//     }
//   } catch (err) {
//     return res.status(500).json({
//       status: 0,
//       message: "server error",
//     });
//   }
// };

exports.UpdatePostTable = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    const { id, description, title, files } = req.body;
    const checkExist = await PostTables.findOne({
      where: { id, userId: req.userId },
      order: [["createdAt", "desc"]],
    });
    if (checkExist) {
      checkExist.description = description;
      checkExist.title = title;
      checkExist.files = files;
      checkExist.save();
      return res.status(200).json({
        status: 1,
        message: "PostTable Updated Successfully",
      });
    } else {
      return res.status(500).json({
        status: 0,
        message: "User not found",
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.getAllPost = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    const getallpost = await PostTables.findAll({
      order: [["createdAt", "desc"]],
    });
    if (getallpost) {
      return res.status(200).json({
        status: 1,
        message: "Get all post successfully",
        posts: getallpost,
      });
    } else {
      return res.status(200).json({
        status: 0,
        message: " not found",
      });
    }
  } catch (e) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.postcomment = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    const { posttableId, Comment_Text } = req.body;
    const postItems = await postcomments.create({
      Comment_Text,
      User_id: req.userId,
      posttableId: posttableId,
    });
    if (postItems) {
      return res.status(200).json({
        status: 1,
        message: "Comments post successfully",
      });
    } else {
      return res.status(200).json({
        status: 0,
        message: "something is missing",
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: 0,
      message: "server error",
    });
  }
};

exports.deletePostComment = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    const { id } = req.body;
    const deletecomment = await postcomments.destroy({
      where: { id, User_id: req.userId },
      order: [["createdAt", "desc"]],
    });
    if (deletecomment) {
      return res.status(200).json({
        status: 1,
        message: "PostComment Deleted Successfully",
      });
    } else {
      return res.status(200).json({
        status: 0,
        message: "not found",
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.getAllPostComments = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    const { posttableId } = req.query;
    const getpost = await postcomments.findAll({
      where: { posttableId: posttableId },
      order: [["createdAt", "desc"]],
    });
    if (getpost) {
      return res.status(200).json({
        status: 1,
        message: "Get all postcommomt successfully",
        posts: getpost,
      });
    } else {
      return res.status(200).json({
        status: 0,
        message: " not found",
      });
    }
  } catch (e) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.UpdatePostComments = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    const { Comment_Text, id } = req.body;
    const checkExist = await postcomments.findOne({
      where: { id, User_id: req.userId },
      order: [["createdAt", "desc"]],
    });
    if (checkExist) {
      checkExist.Comment_Text = Comment_Text;
      checkExist.save();
      return res.status(200).json({
        status: 1,
        message: "PostComment Updated Successfully",
      });
    } else {
      return res.status(500).json({
        status: 0,
        message: "not found",
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.getallpost = async function (req, res, next) {
  if (req.userId == undefined) {
    return res.status(401).json({
      status: 0,
      message: "request not authorize.",
    });
  }
  PostTables.getAllpost11()
    .then((data) => {
      res.status(200).json({
        status: 1,
        message: "get all post",
        data: data,
      });
    })
    .catch((err) => {
      console.log("Error", err);
      res.status(500).json({
        status: 0,
        message: "something went wrong",
      });
    });
};

exports.deletePost = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    const { id } = req.body;
    const Deletepost = await PostTables.destroy({
      where: { id, userId: req.userId },
      order: [["createdAt", "desc"]],
    });
    if (Deletepost) {
      return res.status(200).json({
        status: 1,
        message: "Post Deleted Successfully",
      });
    } else {
      return res.status(200).json({
        status: 0,
        message: "not found",
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.PostLike = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    const { posttableId } = req.body;
    const temp = await PostTables.findOne({
      where: { id: posttableId },
      order: [["createdAt", "desc"]],
    });
    if (!temp) {
      return res.status(400).json({
        status: 0,
        message: "This posttableId is not available",
      });
    }
    const likedUser = await postlike.findOne({
      where: {
        UserId: req.userId,
        posttableId: posttableId,
      },
      order: [["createdAt", "desc"]],
    });
    if (likedUser) {
      return res.status(200).json({
        status: 1,
        message: "This user already liked the post",
      });
    } else {
      const { posttableId } = req.body;
      const postLike = await postlike.create({
        UserId: req.userId,
        posttableId: posttableId,
      });
      if (postLike) {
        return res.status(200).json({
          status: 1,
          message: "PostLike created successfully",
        });
      } else {
        return res.status(200).json({
          status: 0,
          message: "something is missing",
        });
      }
    }
  } catch (err) {
    return res.status(500).json({
      status: 0,
      message: "server error",
    });
  }
};

exports.deletePostLike = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    const { posttableId } = req.body;
    const Deletepostlike = await postlike.destroy({
      where: { posttableId: posttableId, UserId: req.userId },
      order: [["createdAt", "desc"]],
    });
    if (Deletepostlike) {
      return res.status(200).json({
        status: 1,
        message: "Postlike Deleted Successfully",
      });
    } else {
      return res.status(200).json({
        status: 0,
        message: "not found",
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.getallpostcomment = async function (req, res, next) {
  if (req.userId == undefined) {
    return res.status(401).json({
      status: 0,
      message: "request not authorize.",
    });
  }
  const { posttableId } = req.query;
  postcomments
    .getAllpostcomment(posttableId)
    .then((data) => {
      res.status(200).json({
        status: 1,
        message: "get all PostComment",
        data: data,
      });
    })
    .catch((err) => {
      console.log("Error", err);
      res.status(500).json({
        status: 0,
        message: "something went wrong",
      });
    });
};

exports.getAllPostnew = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    let data = [];
    const getallpost = await PostTables.findAll({
      order: [["createdAt", "desc"]],
    });
    for (let x of getallpost) {
      const getallpostcomment = await postcomments.findAll({
        where: { posttableId: x.id },
        order: [["createdAt", "desc"]],
      });
      const getuser = await User.findOne({
        where: { id: x.userId },
        attributes: ["firstName", "lastName"],
        order: [["createdAt", "desc"]],
      });

      const getallpostlike = await postlike.findAll({
        where: { posttableId: x.id },
        order: [["createdAt", "desc"]],
      });
      data.push({
        getallpost: { ...x.dataValues, ...getuser.dataValues },
        getallpostcomment: getallpostcomment.length,
        getallpostlike: getallpostlike.length,
      });
    }
    if (data) {
      return res.status(200).json({
        status: 1,
        message: "Get all post successfully",
        posts: data,
      });
    } else {
      return res.status(200).json({
        status: 0,
        message: " not found",
      });
    }
  } catch (e) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.getalluserpostlike = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    const getpostlike = await postlike.findAll({
      where: { UserId: req.userId },
      order: [["createdAt", "desc"]],
    });
    if (getpostlike) {
      return res.status(200).json({
        status: 1,
        message: "Get all user postlike 💁",
        getpostlike: getpostlike,
      });
    } else {
      return res.status(200).json({
        status: 0,
        message: "not found",
      });
    }
  } catch (e) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.getAllPostnew11 = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    let data = [];
    const findfriend = await Friends.findAll({
      where: {
        [Op.or]: [{ userId_1: req.userId }, { userId_2: req.userId }],
      },
      order: [["createdAt", "desc"]],
    });
    let temp = [];
    temp.push(req.userId);
    for (let x of findfriend) {
      if (x.userId_1 == req.userId) {
        temp.push(x.userId_2);
      } else {
        temp.push(x.userId_1);
      }
    }
    if (findfriend) {
      const getallpost = await PostTables.findAll({
        where: {
          userId: { [Op.in]: temp },
        },
        order: [["createdAt", "desc"]],
      });
      if (getallpost) {
        for (let x of getallpost) {
          const getallpostcomment = await postcomments.findAll({
            where: { posttableId: x.id },
            order: [["createdAt", "desc"]],
          });
          if (getallpostcomment) {
            const getuser = await User.findOne({
              where: { id: x.userId },
              attributes: ["firstName", "lastName", "ProfilePic"],
              order: [["createdAt", "desc"]],
            });
            if (getuser) {
              const getallpostlike = await postlike.findAll({
                where: { posttableId: x.id },
                order: [["createdAt", "desc"]],
              });
              if (getallpostlike) {
                const postlikeTrueFalse = await postlike.findAll({
                  where: { UserId: req.userId, posttableId: x.id },
                  order: [["createdAt", "desc"]],
                });
                if (postlikeTrueFalse) {
                  if (postlikeTrueFalse && postlikeTrueFalse.length < 1) {
                    data.push({
                      getallpost: { ...x.dataValues, ...getuser.dataValues },
                      getallpostcomment: getallpostcomment.length,
                      getallpostlike: getallpostlike.length,
                      postlikeTrueFalse: false,
                      isLoggedInUser: req.userId === x.userId,
                    });
                  } else {
                    data.push({
                      getallpost: { ...x.dataValues, ...getuser.dataValues },
                      getallpostcomment: getallpostcomment.length,
                      getallpostlike: getallpostlike.length,
                      postlikeTrueFalse: true,
                      isLoggedInUser: req.userId === x.userId,
                    });
                  }
                }
              }
            }
          }
        }
      }
      if (data) {
        return res.status(200).json({
          status: 1,
          message: "Get all post successfully",
          posts: data,
        });
      } else {
        return res.status(200).json({
          status: 0,
          message: " not found",
        });
      }
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.getallgroups = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    const getgroup = await Group.findAll({ order: [["createdAt", "desc"]] });
    if (getgroup) {
      return res.status(200).json({
        status: 1,
        message: "Get all groups",
        getgroup: getgroup,
      });
    } else {
      return res.status(200).json({
        status: 0,
        message: "not found",
      });
    }
  } catch (e) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.getOnegroup = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    const { id } = req.query;
    const getgroup = await Group.findAll({
      where: { id, userid: req.userId },
      order: [["createdAt", "desc"]],
    });
    if (getgroup) {
      return res.status(200).json({
        status: 1,
        message: "Get one groups",
        getgroup: getgroup,
      });
    } else {
      return res.status(200).json({
        status: 0,
        message: "not found",
      });
    }
  } catch (e) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.getOnepost = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    let data = [];
    const getallpost = await PostTables.findAll({
      where: { userId: req.userId },
      order: [["createdAt", "desc"]],
    });
    for (let x of getallpost) {
      const getallpostcomment = await postcomments.findAll({
        where: { posttableId: x.id },
        order: [["createdAt", "desc"]],
      });
      const getuser = await User.findOne({
        where: { id: x.userId },
        attributes: ["firstName", "lastName", "ProfilePic"],
        order: [["createdAt", "desc"]],
      });

      const getallpostlike = await postlike.findAll({
        where: { posttableId: x.id },
        order: [["createdAt", "desc"]],
      });
      const postlikeTrueFalse = await postlike.findAll({
        where: { UserId: req.userId, posttableId: x.id },
        order: [["createdAt", "desc"]],
      });
      if (postlikeTrueFalse && postlikeTrueFalse.length < 1) {
        data.push({
          getallpost: { ...x.dataValues, ...getuser.dataValues },
          getallpostcomment: getallpostcomment.length,
          getallpostlike: getallpostlike.length,
          postlikeTrueFalse: false,
          isLoggedInUser: req.userId === x.userId,
        });
      } else {
        data.push({
          getallpost: { ...x.dataValues, ...getuser.dataValues },
          getallpostcomment: getallpostcomment.length,
          getallpostlike: getallpostlike.length,
          postlikeTrueFalse: true,
          isLoggedInUser: req.userId === x.userId,
        });
      }
    }
    if (data) {
      return res.status(200).json({
        status: 1,
        message: "Get all post successfully",
        posts: data,
      });
    } else {
      return res.status(200).json({
        status: 0,
        message: " not found",
      });
    }
  } catch (e) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.getallgroupmember = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    // const{id}=req.query
    const getgroupmember = await GroupMembers.findAll(
      //   {
      //   Userid: req.userId,
      //   order: [["createdAt", "desc"]],
      // }
      { order: [["createdAt", "desc"]] }
    );
    if (getgroupmember) {
      return res.status(200).json({
        status: 1,
        message: "Get all groupmembers",
        getgroupmember: getgroupmember,
      });
    } else {
      return res.status(200).json({
        status: 0,
        message: "not found",
      });
    }
  } catch (e) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.deletegroupmember = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    const { groupId } = req.body;
    const Deletegroupmember = await GroupMembers.destroy({
      where: { groupId, UserId: req.userId },
      order: [["createdAt", "desc"]],
    });
    if (Deletegroupmember) {
      return res.status(200).json({
        status: 1,
        message: "Groupmember Deleted Successfully",
      });
    } else {
      return res.status(200).json({
        status: 0,
        message: "This groupmember id is not found",
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.getonegroupmember = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    const { id } = req.query;
    const getgroupmember = await GroupMembers.findAll({
      where: { id: id, UserId: req.userId },
      order: [["createdAt", "desc"]],
    });
    if (getgroupmember) {
      return res.status(200).json({
        status: 1,
        message: "Get one  groupmember",
        getgroupmember: getgroupmember,
      });
    } else {
      return res.status(200).json({
        status: 0,
        message: "not found",
      });
    }
  } catch (e) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.creatGrouporGroupMember = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    const file = req.files;
    const { groupname, description, status, name, groupimage } = req.body;
    const checkExist = await Group.create({
      groupname,
      description,
      status,
      groupimage,
      userid: req.userId,
    });
    if (checkExist) {
      if (groupname) {
        checkExist.groupname = groupname;
      }
      if (description) {
        checkExist.description = description;
      }
      if (status) {
        checkExist.status = status;
      }
      if (name) {
        checkExist.name = name;
      }
      if (file) {
        checkExist.file = file;
      }
      if (checkExist) {
        if (file?.length > 0) {
          AwsS3.uploadFiles(file, name + "/").then(async (data) => {
            checkExist.groupimage = data;
            await checkExist.save();
            return res.status(200).json({
              status: 1,
              message: "Updated GroupImage Successfully",
            });
          });
        } else {
          return res.status(200).json({
            status: 1,
            message: "Updated GroupImage Successfully",
          });
        }
      } else {
        return res.status(400).json({
          status: 0,
          message: "something went wrong",
        });
      }
    }
    const postgroupMem = await GroupMembers.create({
      groupId: checkExist.id,
      UserId: req.userId,
      status,
    });
    if (checkExist) {
      return res.status(200).json({
        status: 1,
        message: "Group or GroupMembers details saved successfully",
      });
    } else {
      return res.status(500).json({
        status: 0,
        message: "Some field is missing",
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: 0,
      message: "server error",
    });
  }
};

exports.joinedgroupmember = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    // const{id}=req.query
    const getgroupmember = await Group.findAll({
      where: { userid: req.userId },
      order: [["createdAt", "desc"]],
    });
    console.log(req.userId);
    if (getgroupmember) {
      return res.status(200).json({
        status: 1,
        message: "Get all groupmembers",
        getgroupmember: getgroupmember,
      });
    } else {
      return res.status(200).json({
        status: 0,
        message: "not found",
      });
    }
  } catch (e) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.joinedgroupmember11 = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    // const{id}=req.query
    const getgroupmember = await Group.findAll({
      where: {
        userid: {
          [Op.ne]: req.userId,
        },
      },
      order: [["createdAt", "desc"]],
    });
    console.log(req.userId);
    if (getgroupmember) {
      return res.status(200).json({
        status: 1,
        message: "Get all groupmembers",
        getgroupmember: getgroupmember,
      });
    } else {
      return res.status(200).json({
        status: 0,
        message: "not found",
      });
    }
  } catch (e) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.joinedgroupmembercount = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    let data = [];
    const getgroupmember = await Group.findAll({
      where: { userid: req.userId },
      order: [["createdAt", "desc"]],
    });
    // console.log(getgroupmember, "dgdfgdfg");
    const getgroupmember1 = await Group.findAll({
      where: {
        userid: {
          [Op.ne]: req.userId,
        },
      },
      order: [["createdAt", "desc"]],
    });
    data.push({
      Joinedgroupmember: getgroupmember,
      SuggestionGroup: getgroupmember1,
    });
    if (data) {
      return res.status(200).json({
        status: 1,
        message: "Get all groupmembers",
        data: data,
      });
    } else {
      return res.status(200).json({
        status: 0,
        message: "not found",
      });
    }
  } catch (e) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.joinedgroupmembercount13 = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    let data = [];
    const getgroupmember = await GroupMembers.findAll({
      where: { id: req.userId },
      order: [["createdAt", "desc"]],
    });
    const getgroupmember1 = await Group.findAll({
      where: {
        userid: {
          [Op.ne]: req.userId,
        },
      },
      order: [["createdAt", "desc"]],
    });
    const groupmm = await GroupMembers.findAll({
      UserId: req.groupId,
      order: [["createdAt", "desc"]],
    });
    console.log(groupmm);
    data.push({
      Joinedgroupmember: getgroupmember,
      SuggestionGroup: getgroupmember1,
    });
    if (data) {
      return res.status(200).json({
        status: 1,
        message: "Get all groupmembers",
        data: data,
      });
    } else {
      return res.status(200).json({
        status: 0,
        message: "not found",
      });
    }
  } catch (e) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.updateprofilenew = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    const file = req.files;
    const { name } = req.body;
    const checkExist = await User.findOne({
      where: { id: req.userId },
      order: [["createdAt", "desc"]],
    });
    // console.log(checkExist);
    if (checkExist) {
      if (file?.length > 0) {
        AwsS3.uploadFiles(file, name + "/").then(async (data) => {
          checkExist.ProfilePic = data;
          await checkExist.save();
          return res.status(200).json({
            status: 1,
            message: "Profile Updated Successfully",
          });
        });
      } else {
        return res.status(200).json({
          status: 0,
          message: "not found",
        });
      }
    } else {
      return res.status(400).json({
        status: 0,
        message: "something went wrong",
      });
    }
  } catch (e) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.getallgroupmember1 = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    let data = [];
    const getgroupid = await GroupMembers.findAll({
      where: { UserId: req.userId },
      attributes: ["groupId"],
      order: [["createdAt", "desc"]],
    });
    let data1 = [];
    for (let x of getgroupid) {
      data1.push(x.groupId);
    }
    // console.log(data1);
    const getgroup = await Group.findAll({
      where: {
        id: { [Op.in]: data1 },
      },
      order: [["createdAt", "desc"]],
    });
    const getgroupsuggestion = await Group.findAll({
      where: {
        id: {
          [Op.notIn]: data1,
        },
      },
      order: [["createdAt", "desc"]],
    });
    let data2 = [];
    for (let r of getgroupsuggestion) {
      const user = JSON.parse(JSON.stringify(r));
      const gruoM = await GroupMembers.findAll({
        where: { groupId: user.id },
        order: [["createdAt", "desc"]],
      });
      user.userCount = gruoM.length;
      data2.push(user);
    }
    data.push({
      usergroup: getgroup,
      // groupforsuggestion: getgroupsuggestion,
      groupforsuggestion: data2,
    });

    // data.push({ usergroup: getgroup, groupforsuggestion: getgroupsuggestion });
    if (data) {
      return res.status(200).json({
        status: 1,
        message: "Get all groupmembers",
        getgroupmember: data,
      });
    } else {
      return res.status(200).json({
        status: 0,
        message: "not found",
      });
    }
  } catch (e) {
    console.log(e, "error");
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

// exports.getallgroupmember12 = async (req, res, next) => {
//   try {
//     if (req.userId == undefined) {
//       return res.status(401).json({
//         status: 0,
//         message: "request not authorize.",
//       });
//     }
//     let data = [];
//     const getgroupid = await GroupMembers.findAll({
//       where: { UserId: req.userId },
//       attributes: ["groupId"],
//     });
//     let data1 = [];
//     for (let x of getgroupid) {
//       data1.push(x.groupId);
//     }
//     // console.log(data1);
//     const getgroup = await Group.findAll({
//       where: {
//         id: { [Op.in]: data1 },
//       },
//     });
//     const getgroupsuggestion = await Group.findAll({
//       where: {
//         id: {
//           [Op.notIn]: data1,
//         },
//       },
//     });
//     let data2 = [];
//     for (let r of getgroupsuggestion) {
//       const user = JSON.parse(JSON.stringify(r));
//       const gruoM = await GroupMembers.findAll({ where: { groupId: user.id } });
//       user.userCount = gruoM.length;
//       data2.push(user);
//     }
//     data.push({
//       usergroup: getgroup,
//       // groupforsuggestion: getgroupsuggestion,
//       groupforsuggestion: data2,
//     });

//     if (data) {
//       return res.status(200).json({
//         status: 1,
//         message: "Get all groupmembers",
//         getgroupmember: data,
//       });
//     } else {
//       return res.status(200).json({
//         status: 0,
//         message: "not found",
//       });
//     }
//   } catch (e) {
//     return res.status(500).json({
//       status: 0,
//       message: "something went wrong",
//     });
//   }
// };

exports.getmember = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    let data = [];
    const { id } = req.query;
    const getgroup = await Group.findAll({
      where: { id },
      order: [["createdAt", "desc"]],
    });
    for (let x of getgroup) {
      const getgroupmember = await GroupMembers.findAll({
        where: { groupId: x.id },
        order: [["createdAt", "desc"]],
      });
      data.push({ getgroup: x, TotalMember: getgroupmember.length });
    }
    if (data) {
      return res.status(200).json({
        status: 1,
        message: "Get all groupmembers",
        getgroupmember: data,
      });
    } else {
      return res.status(200).json({
        status: 0,
        message: "not found",
      });
    }
  } catch (e) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.updategroupImage = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    const file = req.files;
    const { groupname, description, status, name, groupimage } = req.body;
    const checkExist = await Group.create({
      groupname,
      description,
      status,
      groupimage,
      userid: req.userId,
    });
    if (checkExist) {
      if (groupname) {
        checkExist.groupname = groupname;
      }
      if (description) {
        checkExist.description = description;
      }
      if (status) {
        checkExist.status = status;
      }
      if (name) {
        checkExist.name = name;
      }
      if (file) {
        checkExist.file = file;
      }
      if (checkExist) {
        if (file?.length > 0) {
          AwsS3.uploadFiles(file, name + "/").then(async (data) => {
            checkExist.groupimage = data;
            await checkExist.save();
            return res.status(200).json({
              status: 1,
              message: "Updated GroupImage Successfully",
            });
          });
        } else {
          return res.status(200).json({
            status: 1,
            message: "Updated GroupImage Successfully",
          });
        }
      } else {
        return res.status(400).json({
          status: 0,
          message: "something went wrong",
        });
      }
    }
  } catch (e) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.updateCommunityPost = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    const file = req.files;
    const { description, title, files, name } = req.body;
    const checkExist = await PostTables.create({
      description,
      title,
      files,
      userId: req.userId,
    });
    if (checkExist) {
      if (description) {
        checkExist.description = description;
      }
      if (title) {
        checkExist.title = title;
      }
      if (file) {
        checkExist.file = file;
      }
      if (name) {
        checkExist.name = name;
      }
      if (checkExist) {
        if (file?.length > 0) {
          AwsS3.uploadFiles(file, name + "/").then(async (data) => {
            checkExist.files = data;
            await checkExist.save();
            return res.status(200).json({
              status: 1,
              message: "Updated CommunityPost Successfully",
            });
          });
        } else {
          return res.status(200).json({
            status: 1,
            message: "Updated CommunityPost Successfully",
          });
        }
      } else {
        return res.status(400).json({
          status: 0,
          message: "something went wrong",
        });
      }
    }
  } catch (e) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.createChate = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    const { userid_2, Text } = req.body;
    const checkExist = await chatconnection.findOne({
      where: {
        [Op.or]: [
          { [Op.and]: [{ userid_1: req.userId }, { userid_2: userid_2 }] },
          { [Op.and]: [{ userid_2: req.userId }, { userid_1: userid_2 }] },
        ],
      },
      order: [["createdAt", "desc"]],
    });
    if (checkExist) {
      const checkExist1 = await chat.findOne({
        where: {
          [Op.or]: [
            { [Op.and]: [{ senderid: req.userId }, { reciverid: userid_2 }] },
            { [Op.and]: [{ reciverid: req.userId }, { senderid: userid_2 }] },
          ],
        },
        order: [["createdAt", "desc"]],
      });
      if (checkExist1) {
        return res.status(200).json({
          status: 1,
          message: "already exit",
        });
      }
      const postgroupMem = await chat.create({
        ChatconnectionId: checkExist1.id,
        senderid: req.userId,
        reciverid: checkExist1.userid_2,
        Text,
      });
    } else {
      const postgroupMem1 = await chatconnection.create({
        userid_1: req.userId,
        userid_2: userid_2,
      });
      const postgroupMem2 = await chat.create({
        ChatconnectionId: postgroupMem1.id,
        senderid: req.userId,
        reciverid: postgroupMem1.userid_2,
        Text,
      });
    }
    if (checkExist) {
      return res.status(200).json({
        status: 1,
        message: "chat details saved successfully",
      });
    } else {
      return res.status(200).json({
        status: 1,
        message: "chat details saved successfully",
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: 0,
      message: "server error",
    });
  }
};

exports.findchat = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    const userfind = await chat.findOne({
      where: { senderid: req.userId },
      order: [["createdAt", "desc"]],
    });
    if (userfind) {
      return res.status(200).json({
        status: 1,
        message: "Find successfully",
        userfind: userfind,
      });
    } else {
      return res.status(200).json({
        status: 0,
        message: "This user is not found",
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.findallchat = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    let data = [];
    const userfind = await chatconnection.findAll({
      where: { [Op.or]: [{ userid_1: req.userId }, { userid_2: req.userId }] },
      order: [["createdAt", "desc"]],
    });
    console.log(userfind);
    for (let x of userfind) {
      console.log(x.id);
      let temp;
      if (x.userid_1 == req.userId) {
        temp = x.userid_2;
      } else {
        temp = x.userid_1;
      }
      const user = await User.findOne({
        where: { id: temp },
        order: [["createdAt", "desc"]],
      });
      console.log(user);
      data.push({ chatid: x.id, user: user });
    }

    if (data) {
      return res.status(200).json({
        status: 1,
        message: "FindAllChat successfully",
        userfind: data,
      });
    } else {
      return res.status(200).json({
        status: 0,
        message: "This user is not found",
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.getAllchatuser = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    const { ChatconnectionId } = req.query;
    const getallchat = await chat.findAll({
      where: { ChatconnectionId },
      order: [["createdAt", "ASC"]],
    });
    if (getallchat) {
      return res.status(200).json({
        status: 1,
        message: "Get all chatuser successfully",
        getallchat: getallchat,
      });
    } else {
      return res.status(200).json({
        status: 0,
        message: " not found",
      });
    }
  } catch (e) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    const { UserOtp } = req.body;
    const isValid = await User.findOne({
      where: { id: req.userId, UserOtp: UserOtp },
      order: [["createdAt", "desc"]],
    });
    if (isValid) {
      return res.status(200).json({
        status: 1,
        message: "UserOtp verified successfully",
        isValid: isValid,
      });
    } else {
      return res.status(200).json({
        status: 0,
        message: "UserOtp not verfied",
      });
    }
  } catch (e) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.resendOtp = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    const { phoneNumber } = req.body;
    const data = await User.findOne({
      where: { id: req.userId, phoneNumber: phoneNumber },
      order: [["createdAt", "desc"]],
    });
    if (data) {
      let UserOtp = Math.floor(100000 + Math.random() * 900000);
      const currentOtp = await User.update(
        { UserOtp: UserOtp },
        { where: { id: req.userId }, order: [["createdAt", "desc"]] }
      );
      var params = {
        Message:
          "Your Offloads code is " +
          UserOtp +
          ". You can use this code to verify your account.",
        PhoneNumber: phoneNumber,
      };
      var publishTextPromise = new AWS.SNS({
        apiVersion: "2010-03-31",
      })
        .publish(params)
        .promise()
        .then(function (data) {})
        .catch(function (err) {});
      if (currentOtp) {
        return res.status(200).json({
          status: 1,
          message: "UserOtp send successfully",
          currentOtp: params,
        });
      }
    } else {
      return res.status(200).json({
        status: 1,
        message: "Phone number not found",
      });
    }
  } catch (e) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.sendPhotoInChat = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    const file = req.files;
    const { name } = req.body;
    if (file?.length > 0) {
      AwsS3.uploadFiles(file, name + "/").then(async (data) => {
        return res.status(200).json({
          status: 1,
          message: "Photo send Successfully",
          data: data,
        });
      });
    }
  } catch (e) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.postPostedByGroup = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    const file = req.files;
    const { description, title, files, name } = req.body;
    const findgroupid = await Group.findOne();
    if (findgroupid) {
      const checkExist = await PostTables.create({
        description,
        title,
        files,
        groupid: findgroupid.id,
      });
      if (checkExist) {
        if (description) {
          checkExist.description = description;
        }
        if (title) {
          checkExist.title = title;
        }
        if (file) {
          checkExist.file = file;
        }
        if (name) {
          checkExist.name = name;
        }
        if (checkExist) {
          if (file?.length > 0) {
            AwsS3.uploadFiles(file, name + "/").then(async (data) => {
              checkExist.files = data;
              await checkExist.save();
              return res.status(200).json({
                status: 1,
                message: "This post is Posted by group Successfully",
              });
            });
          } else {
            return res.status(200).json({
              status: 1,
              message: "This post is Posted by group Successfully",
            });
          }
        } else {
          return res.status(400).json({
            status: 0,
            message: "something went wrong",
          });
        }
      }
    }
  } catch (e) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.getAllgroupPost = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    let data = [];
    const { id } = req.query;
    const findallgroupPost = await Group.findAll({
      where: { id: id },
      order: [["createdAt", "desc"]],
    });
    // if (findallgroupPost) {
    const getallpost = await PostTables.findAll({
      where: { groupid: findallgroupPost[0].dataValues.id },
      order: [["createdAt", "desc"]],
    });
    if (getallpost) {
      for (let x of getallpost) {
        const getallpostcomment = await postcomments.findAll({
          where: { posttableId: x.id },
          order: [["createdAt", "desc"]],
        });
        // if (getallpostcomment) {
        const getuser = await User.findOne({
          where: { id: id },
          attributes: ["firstName", "lastName", "ProfilePic"],
          order: [["createdAt", "desc"]],
        });
        // if (getuser) {
        const getallpostlike = await postlike.findAll({
          where: { posttableId: x.dataValues.id },
          order: [["createdAt", "desc"]],
        });
        // if (getallpostlike) {
        const postlikeTrueFalse = await postlike.findAll({
          where: { UserId: req.userId, posttableId: x.dataValues.id },
          order: [["createdAt", "desc"]],
        });
        // if (postlikeTrueFalse) {
        if (postlikeTrueFalse && postlikeTrueFalse.length < 1) {
          data.push({
            getallpost: Object.assign(x.dataValues, getuser.dataValues),
            getallpostcomment: getallpostcomment.length,
            getallpostlike: getallpostlike.length,
            postlikeTrueFalse: false,
            isLoggedInUser: req.userId === x.userId,
          });
        } else {
          data.push({
            getallpost: Object.assign(x.dataValues, getuser.dataValues),
            getallpostcomment: getallpostcomment.length,
            getallpostlike: getallpostlike.length,
            postlikeTrueFalse: false,
            isLoggedInUser: req.userId === x.userId,
          });
        }
        // }
        // }
        // }
        // }
      }
    }
    if (data) {
      return res.status(200).json({
        status: 1,
        message: "Get all post successfully",
        posts: data,
      });
    } else {
      return res.status(200).json({
        status: 0,
        message: " not found",
      });
    }
    // }
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

// exports.UpdateCommunityPost = async (req, res, next) => {
//   try {
//     if (req.userId == undefined) {
//       return res.status(401).json({
//         status: 0,
//         message: "request not authorize.",
//       });
//     }
//     const file = req.files;
//     const { name, id } = req.body;
//     const checkExist = await PostTables.findOne({
//       where: { id, userId: req.userId },
//       order: [["createdAt", "desc"]],
//     });
//     if (checkExist) {
//       if (file?.length > 0) {
//         AwsS3.uploadFiles(file, name + "/").then(async (data) => {
//           checkExist.files = data;
//           await checkExist.save();
//           return res.status(200).json({
//             status: 1,
//             message: "UpdateCommunityPost Successfully",
//           });
//         });
//       }
//     } else {
//       return res.status(200).json({
//         status: 0,
//         message: "user id not found",
//       });
//     }
//   } catch (e) {
//     return res.status(500).json({
//       status: 0,
//       message: "something went wrong",
//     });
//   }
// };

exports.blockuser = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    const { USERID_2 } = req.body;
    const temp = await User.findOne({
      where: { id: USERID_2 },
      order: [["createdAt", "desc"]],
    });
    if (!temp) {
      return res.status(400).json({
        status: 0,
        message: "User not available",
      });
    }
    const findblockuser = await Block.findOne({
      where: { USERID_2: USERID_2, USERID_1: req.userId },
      order: [["createdAt", "desc"]],
    });
    if (findblockuser) {
      return res.status(200).json({
        status: 1,
        message: "You Already blocked",
        findblockuser: findblockuser,
      });
    } else {
      const { USERID_1, USERID_2 } = req.body;
      const userId = req.userId;
      const creatingblock = await Block.create({
        USERID_1,
        USERID_2,
        USERID_1: userId,
      });
      if (creatingblock) {
        return res.status(200).json({
          status: 1,
          message: "User blocked details saved successfully",
        });
      } else {
        return res.status(500).json({
          status: 0,
          message: "User not post",
        });
      }
    }
  } catch (err) {
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.getAllFriend1 = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    let temp1 = [];
    const getfriend = await Friends.findAll({
      where: {
        status: 1,
        [Op.or]: [{ userId_1: req.userId }, { userId_2: req.userId }],
      },
    });
    for (let x of getfriend) {
      if (x.userId_1 == req.userId) {
        temp1.push(x.userId_2);
      } else {
        temp1.push(x.userId_1);
      }
    }
    if (getfriend) {
      const userdata = await User.findAll({
        where: {
          id: { [Op.in]: temp1 },
        },
      });
      if (userdata) {
        return res.status(200).json({
          status: 1,
          message: "Get user data successfully",
          getfriend: userdata,
        });
      } else {
        return res.status(200).json({
          status: 0,
          message: "User data not found",
        });
      }
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.getOneFriend = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    let temp1 = [];
    const getfriend = await Friends.findAll({
      where: {
        status: 0,
        userId_2: req.userId,
      },
    });
    for (let x of getfriend) {
      temp1.push(x.userId_1);
    }
    if (getfriend) {
      const userdata = await User.findAll({
        where: {
          id: { [Op.in]: temp1 },
        },
      });
      if (userdata) {
        return res.status(200).json({
          status: 1,
          message: "Get user data successfully",
          getfriend: userdata,
        });
      } else {
        return res.status(200).json({
          status: 0,
          message: "User data not found",
        });
      }
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};

exports.getSuggestionfriend = async (req, res, next) => {
  try {
    if (req.userId == undefined) {
      return res.status(401).json({
        status: 0,
        message: "request not authorize.",
      });
    }
    let temp = [];
    let temp1 = [];
    const getfriend = await Friends.findAll({
      where: {
        status: 1,
        [Op.or]: [{ userId_1: req.userId }, { userId_2: req.userId }],
      },
    });
    for (let x of getfriend) {
      if (x.userId_1 == req.userId) {
        temp1.push(x.userId_2);
      } else {
        temp1.push(x.userId_1);
      }
    }
    if (getfriend) {
      const userdata = await SuggestionFriend.findAll({
        where: {
          Usersid: req.userId,
        },
      });
      let NotSuggestionFriend = [];
      for (let x of userdata) {
        NotSuggestionFriend.push(x.NotSuggestionFriend);
      }
      temp = [...temp1, ...NotSuggestionFriend];
      const userdata1 = await User.findAll({
        where: {
          id: { [Op.in]: temp },
        },
      });
      if (userdata1) {
        return res.status(200).json({
          status: 1,
          message: "Get user data successfully",
          getfriend: userdata1,
        });
      } else {
        return res.status(200).json({
          status: 0,
          message: "User data not found",
        });
      }
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      status: 0,
      message: "something went wrong",
    });
  }
};
