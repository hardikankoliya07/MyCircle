var express = require('express');
var router = express.Router();
const Notification = require('../models/notification');

router.get('/', async (req, res, next) => {
    const userId = req.query.userId;
    if (userId) {
        const data = await Notification.find({ notificationFor: userId, isSeen: false }, { updatedOn: 0 }).sort({ createdOn: -1 }).limit(5).lean()
        res.render('partials/notification/index', { notificationData: data, layout: 'blank' });
    } else {
        const data = await Notification.find({ notificationFor: req.user._id }, { updatedOn: 0 }).sort({ createdOn: -1 }).lean()
        res.render('partials/notification/all', { title: "Notification", notificationData: data });
    }
})

router.put('/', async (req, res, next) => {
    const { id, postId } = req.query;
    await Notification.findByIdAndUpdate({ _id: id }, { $set: { isSeen: true } })
    res.send({
        id: id,
        postId: postId
    })
})

module.exports = router;