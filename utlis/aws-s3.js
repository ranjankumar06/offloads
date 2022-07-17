const fs = require('fs');
const path = require('path')
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    region: 'us-east-1',
    accessKeyId: process.env.Access_key_ID,
    secretAccessKey: process.env.Secret_access_key
});

var myBucket = process.env.bucket;

exports.uploadFile = function (file, key) {
    return new Promise(function (resolve, reject) {
        fs.readFile(file.path, function (err, data) {
            if (err) {
                throw err;
            }
            // console.log("data", data)
            params = { Bucket: myBucket, Key: key, Body: data, ACL: 'public-read', ContentType: file.mimetype };
            s3.putObject(params, function (err, data) {
                if (err) {
                    reject(err);
                    console.log(err)
                } else {
                    resolve(key);
                    // console.log("Successfully uploaded data to myBucket/myKey" + data);
                }
            });
        });
    })
}

exports.uploadFiles = function (files, prefix) {
    return new Promise(function (resolve, reject) {
        var s3KeyArr = [];
        for (var i = 0; i < files.length; i++) {
            const file = files[i];
            let fileExt = path.extname(file.originalname);
            let myKey = prefix + file.filename.replace(/\s/g, '');
            fs.readFile(file.path, function (err, data) {
                if (err) {
                    throw err;
                }
                params = { Bucket: myBucket, Key: myKey, Body: data,ContentType: file.mimetype };
                s3.putObject(params, function (err, data) {
                    // console.log("====>" ,data)
                    if (err) {
                        reject(err);
                        console.log(err)
                    } else {
                        s3KeyArr.push({ "s3key": myKey });
                        fs.unlinkSync(file.path);
                        if (s3KeyArr.length === files.length) {
                            resolve(s3KeyArr);
                        }
                    }
                });
            });
        }
    });
}

exports.uploadPDF = function (files, prefix) {
    return new Promise(function (resolve, reject) {
        var s3KeyArr = [];
        for (var i = 0; i < files.length; i++) {
            const file = files[i];
            // let fileExt = path.extname(file.originalname);
            let myKey = prefix + file.filename 
            // + fileExt;
            fs.readFile(file.path, function (err, data) {
                if (err) {
                    throw err;
                }
                params = {
                    Bucket: myBucket,
                    Key: myKey,
                    Body: data,
                    ACL: 'public-read',
                    ContentType: file.mimetype
                };
                s3.putObject(params, function (err, data) {
                    if (err) {
                        reject(err);
                    } else {
                        s3KeyArr.push({
                            "s3key": myKey
                        });
                        // fs.unlinkSync(file.path);

                        if (s3KeyArr.length === files.length) {
                            resolve(s3KeyArr);
                        }
                    }
                });
            });
        }
    });
}

    ;

exports.uploadSheet = function (files, prefix) {
    return new Promise(function (resolve, reject) {
        let key = prefix + '.xlsx'
        fs.readFile(files, function (err, data) {
            if (err) {
                resolve(0)
            }
            params = {
                Bucket: myBucket,
                Key: key,
                Body: data,
                ACL: 'public-read',
                // ContentType: file.mimetype
            };
            s3.putObject(params, function (err, data1) {
                if (err)
                    resolve(0)// an error occurred
                else {
                    fs.unlinkSync(files);
                    resolve(1); // successful response
                }
            });
        })
    });
}


