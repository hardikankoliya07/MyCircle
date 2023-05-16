var express = require('express');
var router = express.Router();
const Chat = require('../models/chat');
const User = require('../models/user');

router.get('/', async (req, res, next) => {
    const data = await User.find({ _id: { $ne: req.user._id } }, { _id: 1, full_name: 1, profile: 1 }).lean()
    res.render('chat/index', { title: 'Chats', data: data })
})

module.exports = router;