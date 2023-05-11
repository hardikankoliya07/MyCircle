var express = require('express');
var router = express.Router();
const Notification = require('../models/notification');

router.get('/', async (req, res, next) => {
    const userId = req.query.userId;
    const data = await Notification.find({ notificationFor: userId }, { updatedOn: 0 }).lean()
    res.render('partials/notification/index', { notificationData: data, layout: 'blank' })
})

module.exports = router;