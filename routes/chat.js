var express = require('express');
var router = express.Router();
const Chat = require('../models/chat');

router.get('/', async (req, res, next) => {
    res.render('chat/index', { title: 'Chats' })
})

module.exports = router;