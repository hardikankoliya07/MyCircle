var express = require('express');
var router = express.Router();
const UserModel = require('../models/user');
const path = require('path')
const multer = require('multer')
const userControl = require('../controller/user')

router.get('/', async (req, res, next) => {
    const searchUser = req.query.searchUser;
    const data = await userControl.user(req);
    if (searchUser || searchUser == "") {
        res.render('partials/user/filter', { title: 'User List', data: data, layout: 'blank' });
    } else {
        res.render('user/index', { title: 'User List', data: data });
    }
})

router.get('/getData/', async (req, res, next) => {
    try {
        const data = await UserModel.findOne({ _id: req.user._id });
        res.send({
            type: 'success',
            data: data
        });
    } catch (error) {
        res.error({
            type: 'error',
            message: "user not Found"
        });
    }
})

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./public/images/uploads/")
    },
    filename: function (req, file, callback) {
        let ext = path.extname(file.originalname);
        callback(null, `${req.user._id}${ext}`)
    }
})

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' && ext !== '.PNG' && ext !== '.JPG' && ext !== '.GIF' && ext !== '.JPEG') {
            return callback(new Error('Only images are allowed'))
        }
        callback(null, true)
    },
    limits: {
        fileSize: 1024 * 1024
    }
}).single('profile')

router.put('/', async function (req, res, next) {
    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            res.send({
                type: 'error',
                message: "Max file size 2MB allowed!"
            })
        } else if (err) {
            res.send({
                type: 'error',
                message: err.message
            })
        } else {
            req.body.profile = req.file?.filename;
            await UserModel.findByIdAndUpdate({ _id: req.user._id }, { $set: req.body })
            res.send({
                type: 'success',
                message: 'User update successfully'
            });
        }
    })
});

module.exports = router;