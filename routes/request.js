var express = require('express');
var router = express.Router();
const requestControl = require('../controller/request');
const Follow = require('../models/follow');

router.get('/', async (req, res, next) => {
    const data = await requestControl.request(req);
    let filterReq = data.filter(req => req.status == 'requested');
    res.render('partials/request/request', { reqData: filterReq, layout: 'blank' })
});

router.put('/', async (req, res, next) => {
    const { reqId, followingId, followerId } = req.body;
    await Follow.findByIdAndUpdate({ _id: reqId }, { $set: { status: 'following' } });
    const exist = await Follow.countDocuments({ followingId: followerId, followerId: followingId });
    if (!exist) {
        const reqData = {
            followingId: followerId,
            followerId: followingId,
            status: 'follow back'
        }
        await Follow.create(reqData);
    }
    const data = await requestControl.request(req);
    const filterReq = data.filter(req => req.status == 'requested');
    res.render('partials/request/request', { reqData: filterReq, layout: 'blank' });
});

router.delete('/', async (req, res, next) => {
    const reqId = req.body.reqId;
    await Follow.findByIdAndDelete({ _id: reqId });
    const data = await requestControl.request(req);
    res.render('partials/request/request', { reqData: data, layout: 'blank' })
});

module.exports = router;