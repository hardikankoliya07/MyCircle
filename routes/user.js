var express = require('express');
var router = express.Router();
const UserModel = require('../models/user');
const path = require('path');
const multer = require('multer');
const userControl = require('../controller/user');
const Follow = require('../models/follow');
const User = require('../models/user');

/** user list route */
router.get('/', async (req, res, next) => {
    try {
        const searchUser = req.query.searchUser;
        const data = await userControl.user(req);
        if (searchUser || searchUser == "") {
            res.render('partials/user/filter', { title: 'User List', data: data, layout: 'blank' });
        } else {
            res.render('user/index', { title: 'User List', data: data });
        };
    } catch (error) {
        res.send({
            status: 500,
            type: 'error',
            message: error.message
        });
    };
});

router.post('/', async (req, res, next) => {
    const { userId, status } = req.body;
    const user = await User.findById({ _id: userId }, { account_status: 1 });
    if (user.account_status == "private") {
        if (status == "Requested") {
            await Follow.findOneAndDelete({ followingId: req.user._id, followerId: userId });
        } else if (status == "Follow back") {
            await Follow.findOneAndUpdate({ followingId: req.user._id, followerId: userId, }, { $set: { status: 'requested' } });
        } else {
            const data = {
                followingId: req.user._id,
                followerId: userId,
                status: 'requested'
            };
            await Follow.create(data);
        }
    } else {
        if (status == "Following") {
            await Follow.findOneAndDelete({ followingId: req.user._id, followerId: userId, });
        } else if (status == "Follow back") {
            await Follow.findOneAndUpdate({ followingId: req.user._id, followerId: userId, }, { $set: { status: 'following' } });
        } else {
            const data = [{
                followingId: req.user._id,
                followerId: userId,
                status: 'following'
            },
            {
                followingId: userId,
                followerId: req.user._id,
                status: 'follow back'
            }];
            await Follow.create(data);
        }
    }
    const newData = await userControl.user(req);
    res.render('partials/user/filter', { data: newData, layout: 'blank' });
});

/** user profile data get route */
router.get('/getData', async (req, res, next) => {
    try {
        const data = await UserModel.findOne({ _id: req.user._id });
        res.send({
            type: 'success',
            data: data
        });
    } catch (error) {
        res.send({
            type: 'error',
            status: 404,
            message: "user not Found"
        });
    };
});

/** user profile image */
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./public/images/uploads/")
    },
    filename: function (req, file, callback) {
        let ext = path.extname(file.originalname);
        callback(null, `${req.user._id}${ext}`)
    }
});

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
}).single('profile');

/** user profile data update route */
router.put('/', async function (req, res, next) {
    try {
        upload(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                res.send({
                    type: 'error',
                    message: "Max file size 2MB allowed!"
                });
            } else if (err) {
                res.send({
                    type: 'error',
                    message: err.message
                });
            } else {
                try {
                    const { first_name, last_name, email, gender, account_status } = req.body;
                    if (first_name == "" || first_name == null) {
                        throw Error('Enter valid first name')
                    } else if (last_name == "" || last_name == null) {
                        throw Error('Enter valid last name')
                    } else if (gender == "" || gender == null) {
                        throw Error('Select your Gender')
                    } else if (account_status == "" || account_status == null) {
                        throw Error('Select your Account Status')
                    } else {
                        const data = {
                            first_name: first_name,
                            last_name: last_name,
                            email: email,
                            gender: gender,
                            account_status: account_status
                        }
                        data.full_name = data.first_name.concat(" ", data.last_name)
                        data.profile = req.file?.filename;
                        req.session.passport.user.first_name = data.first_name
                        req.session.passport.user.last_name = data.last_name
                        req.session.passport.user.email = data.email
                        req.session.passport.user.gender = data.gender
                        req.session.passport.user.account_status = data.account_status
                        req.session.passport.user.profile = req.file?.filename;
                        req.session.passport.user.full_name = data.first_name.concat(" ", data.last_name)
                        console.log(req.session.passport.user);
                        await UserModel.findByIdAndUpdate({ _id: req.user._id }, { $set: data })
                        res.send({
                            type: 'success',
                            message: 'User update successfully'
                        });
                    }
                } catch (error) {
                    res.send({
                        type: 'error',
                        message: error.message
                    });
                };
            };
        });
    } catch (error) {
        res.send({
            type: 'error',
            message: 'Something when wrong'
        });
    };
});

module.exports = router;