var express = require('express');
var router = express.Router();
const Chat = require('../models/chat');
const User = require('../models/user');
const chatControl = require('../controller/chat');

router.get('/', async (req, res, next) => {
    const data = await User.find({ _id: { $ne: req.user._id } }, { _id: 1, full_name: 1, profile: 1 }).lean();
    res.render('chat/index', { title: 'Chats', data: data });
});

router.post('/', async (req, res, next) => {
    const { msg, uId } = req.body;
    const data = {
        sendBy: req.user._id,
        receiveBy: uId,
        message: msg
    };
    io.to(uId).emit('message', msg);
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