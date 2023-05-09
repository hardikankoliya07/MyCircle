var express = require('express');
var router = express.Router();
const notificationControl = require('../controller/notification');
const Follow = require('../models/follow');
const userControl = require('../controller/user');

router.get('/', async (req, res, next) => {
    const data = await notificationControl.request(req);
    const filterReq = data.filter(req => req.status == 'requested');
    res.render('partials/notification/request', { reqData: filterReq, layout: 'blank' })
});

router.put('/', async (req, res, next) => {
    const reqId = req.body.reqId;
    await Follow.findByIdAndUpdate({ _id: reqId }, { $set: { status: 'following' } });
    const data = await notificationControl.request(req);
    const filterReq = data.filter(req => req.status == 'requested');
    res.render('partials/notification/request', { reqData: filterReq, layout: 'blank' })
});

router.delete('/', async (req, res, next) => {
    const reqId = req.body.reqId;
    await Follow.findByIdAndDelete({ _id: reqId });
    const data = await notificationControl.request(req);
    res.render('partials/notification/request', { reqData: data, layout: 'blank' })
});

module.exports = router;