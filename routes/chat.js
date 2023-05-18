var express = require('express');
var router = express.Router();
const Chat = require('../models/chat');
const User = require('../models/user');
const chatControl = require('../controller/chat');

router.get('/', async (req, res, next) => {
    const searchUser = req.query?.searchUser;
    let searchCond = {};
    if (searchUser) {
        searchCond = {
            $or: [
                {
                    first_name: { $regex: searchUser, $options: 'i' },
                },
                {
                    last_name: { $regex: searchUser, $options: 'i' }
                },
                {
                    full_name: { $regex: searchUser, $options: 'i' }
                },
                {
                    email: { $regex: searchUser, $options: 'i' }
                }
            ]
        }
    }
    const data = await User.find({ _id: { $ne: req.user._id }, ...searchCond }, { _id: 1, full_name: 1, profile: 1 }).lean();
    if (searchUser || searchUser == "") {
        res.render('chat/index', { title: 'Chats', data: data, layout: 'blank' });
    } else {
        res.render('chat/index', { title: 'Chats', data: data });
    };
});

router.post('/', async (req, res, next) => {
    const { msg, uId } = req.body;
    const data = {
        sendBy: req.user._id,
        receiveBy: uId,
        message: msg
    };
    io.to(uId).emit('message', data);
    const docs = await Chat.create(data);
    res.send({
        data: docs
    });
});

router.put('/', async (req, res, next) => {
    const data = await chatControl.chat(req);
    res.render('partials/chat/chatBox', { data: data, layout: 'blank' });
});

module.exports = router;