const multer = require('multer')

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './public/images')
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname)
    }
})

var upload = multer({ storage: storage }).array('file', 10)

module.exports = (req, res, next) => {
    upload(req, res, (err) => {
        req.uploadError = false
        if (err) {
            console.log(err,"adslk");
            req.uploadError = true
            return res.end('Error uploading file.')
        }
        next()
    })
}