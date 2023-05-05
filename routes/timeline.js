var express = require('express');
var router = express.Router();
const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')

/** Models */
const postControl = require('../controller/post');
const post = require('../models/post')
const Report = require('../models/report')

router.get('/:archived?', async (req, res, next) => {
    if (!fs.existsSync(path.resolve(__dirname, "../public/images/uploads"))) {
        fs.mkdirSync(path.resolve(__dirname, "../public/images/uploads/"));
    }
    if (!fs.existsSync(path.resolve(__dirname, "../public/images/posts"))) {
        fs.mkdirSync(path.resolve(__dirname, "../public/images/posts"));
    }

    const userReport = await Report.findOne({ userId: req.user._id }).lean()
    const isArchived = req.params.archived;
    const data = await postControl.posts(req)
    const filterPost = req.query.filterPost;
    let cond = { isArchive: false }
    if (filterPost == 'mine') {
        cond.isArchive = false
        cond.postBy = new mongoose.Types.ObjectId(req.user._id)
    } else if (filterPost == 'other') {
        cond.isArchive = false
        cond.postBy = { $ne: new mongoose.Types.ObjectId(req.user._id) }
    }
    const count = await post.countDocuments(cond)
    const pageArr = [];
    for (let i = 0; i < Math.ceil(count / 4); i++) {
        pageArr.push(i + 1)
    }
    if (req.query.filterPost == 'mine' || req.query.filterPost == 'other' || req.query.filterPost == '' || req.query.sortPost == 'date' || req.query.sortPost == 'title') {
        return res.render('partials/post/filter', {
            title: `${(isArchived) ? 'Archived Post' : 'Timeline'}`,
            data: data,
            pages: pageArr,
            layout: 'blank',
            report: userReport
        })
    } else {
        return res.render('timeline', {
            title: `${(isArchived) ? 'Archived Post' : 'Timeline'}`,
            pages: pageArr,
            data: data,
            report: userReport
        })
    }
})

module.exports = router;