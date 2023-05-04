const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const post = require('../models/post');
const savePost = require('../models/savedPost');
const postControl = require('../controller/post');
const Likes = require('../models/likes');
const Comment = require('../models/comments');
const mongoose = require('mongoose');
const commentControl = require('../controller/comments')

router.get('/', async (req, res, next) => {
    const postId = req.query.postId;
    if (postId) {
        // const data = await Comment.aggregate([
        //     {
        //         $match: { postId: new mongoose.Types.ObjectId(postId), parent: { $exists: false } }
        //     },
        //     {
        //         $sort: { createdOn: -1 }
        //     },
        //     {
        //         $lookup: {
        //             from: 'users',
        //             localField: 'commentBy',
        //             foreignField: '_id',
        //             pipeline: [{
        //                 $project: {
        //                     full_name: 1,
        //                     profile: 1
        //                 }
        //             }],
        //             as: 'commentUser'
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: 'comments',
        //             localField: '_id',
        //             foreignField: 'parent',
        //             pipeline: [
        //                 {
        //                     $sort: { createdOn: -1 }
        //                 },
        //                 {
        //                     $lookup: {
        //                         from: 'users',
        //                         localField: 'commentBy',
        //                         foreignField: '_id',
        //                         pipeline: [{
        //                             $project: {
        //                                 full_name: 1,
        //                                 profile: 1
        //                             }
        //                         }],
        //                         as: 'subCommentUser'
        //                     },
        //                 },
        //                 {
        //                     $project: {
        //                         commentBy: 1,
        //                         postId: 1,
        //                         comment: 1,
        //                         createdOn: 1,
        //                         subCommentUser: { $arrayElemAt: ['$subCommentUser', 0] }
        //                     }
        //                 }],
        //             as: 'subComment'
        //         }
        //     },
        //     {
        //         $project: {
        //             commentBy: 1,
        //             postId: 1,
        //             comment: 1,
        //             createdOn: 1,
        //             subComment: 1,
        //             commentUser: { $arrayElemAt: ['$commentUser', 0] }
        //         }
        //     }
        // ]);
        const data = await commentControl.comments(postId)
        res.render('partials/post/comment', {
            data: data,
            layout: 'blank'
        })
    } else {
        const data = await postControl.posts(req)
        const filterData = data.filter(savedData => savedData.saved == 1);
        res.render('post/saved', {
            title: 'Saved Post',
            data: filterData
        })
    }
})

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./public/images/posts/")
    },
    filename: function (req, file, callback) {
        let ext = path.extname(file.originalname);
        callback(null, `post-${Date.now()}${ext}`)
    }
})

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
}).single('postImg');

router.get('/getEdit/:postId', async (req, res, next) => {
    try {
        const data = await post.findOne({ _id: req.params.postId })
        res.send({
            type: 'success',
            data: data
        })
    } catch (error) {
        res.send({
            type: 'error',
            message: "Data not found"
        })
    }
})

const editUpload = multer({
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
}).single('editPostImg');

router.put('/:postId?', async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const likedPostId = req.query.likePostId;
        const commentPostId = req.body.postId;
        const comment = req.body.comment;
        const parent = req.body.parent;
        if (postId) {
            const data = {
                saveBy: req.user._id,
                postId: postId
            }
            const saved = await savePost.countDocuments({ saveBy: req.user._id, postId: postId });
            if (saved) {
                await savePost.deleteOne({ saveBy: req.user._id, postId: postId })
            } else {
                await savePost.create(data)
            }
            res.send({
                type: 'success',
                message: `Post ${(saved) ? "unsaved" : "saved"}  successfully`
            })
        } else {
            if (req.body.postId && req.body.archive) {
                const userPost = await post.countDocuments({ _id: req.body.postId, postBy: req.user._id })
                if (userPost) {
                    const archive = (req.body.archive == 'true') ? { isArchive: false } : { isArchive: true }
                    await post.findByIdAndUpdate({ _id: req.body.postId }, { $set: archive });
                    res.send({
                        type: 'success',
                        message: `Post ${(req.body.archive == 'true') ? "unArchived" : "Archived"} successfully`
                    })
                } else {
                    res.send({
                        type: 'error',
                        message: 'You are not owner of this post'
                    })
                }
            } else if (likedPostId) {
                const data = {
                    likeBy: req.user._id,
                    postId: likedPostId
                }
                const liked = await Likes.countDocuments({ likeBy: req.user._id, postId: likedPostId });
                if (liked) {
                    await Likes.deleteOne({ likeBy: req.user._id, postId: likedPostId })
                } else {
                    await Likes.create(data)
                }
                res.send({
                    type: 'success',
                    message: `Post ${(liked) ? "unLiked..." : "liked..."}`
                })
            } else if (commentPostId && comment || parent) {
                const data = {
                    commentBy: req.user._id,
                    postId: commentPostId,
                    comment: comment,
                };
                data.parent = parent
                await Comment.create([data]);
                // const newData = await Comment.aggregate([
                //     {
                //         $match: { postId: new mongoose.Types.ObjectId(commentPostId), parent: { $exists: false } }
                //     },
                //     {
                //         $sort: { createdOn: -1 }
                //     },
                //     {
                //         $lookup: {
                //             from: 'users',
                //             localField: 'commentBy',
                //             foreignField: '_id',
                //             pipeline: [{
                //                 $project: {
                //                     full_name: 1,
                //                     profile: 1
                //                 }
                //             }],
                //             as: 'commentUser'
                //         }
                //     },
                //     {
                //         $lookup: {
                //             from: 'comments',
                //             localField: '_id',
                //             foreignField: 'parent',
                //             pipeline: [
                //                 {
                //                     $sort: { createdOn: -1 }
                //                 },
                //                 {
                //                     $lookup: {
                //                         from: 'users',
                //                         localField: 'commentBy',
                //                         foreignField: '_id',
                //                         pipeline: [{
                //                             $project: {
                //                                 full_name: 1,
                //                                 profile: 1
                //                             }
                //                         }],
                //                         as: 'subCommentUser'
                //                     },
                //                 },
                //                 {
                //                     $project: {
                //                         commentBy: 1,
                //                         postId: 1,
                //                         comment: 1,
                //                         createdOn: 1,
                //                         subCommentUser: { $arrayElemAt: ['$subCommentUser', 0] }
                //                     }
                //                 }],
                //             as: 'subComment'
                //         }
                //     },
                //     {
                //         $project: {
                //             commentBy: 1,
                //             postId: 1,
                //             comment: 1,
                //             createdOn: 1,
                //             subComment: 1,
                //             commentUser: { $arrayElemAt: ['$commentUser', 0] }
                //         }
                //     }
                // ]);
                const newData = await commentControl.comments(commentPostId)
                res.render('partials/post/comment', {
                    data: newData,
                    layout: 'blank'
                })
            } else {
                editUpload(req, res, async function (err) {
                    if (err instanceof multer.MulterError) {
                        res.send({
                            type: 'error',
                            message: "Max file size 2MB allowed!"
                        })
                    } else if (err) {
                        res.send({
                            type: 'error',
                            message: err.message
                        })
                    } else {
                        const data = {
                            'title': req.body.title,
                            'desc': req.body.desc
                        }
                        if (req.file != undefined) {
                            data.postImg = req.file.filename
                        }
                        const userPost = await post.countDocuments({ _id: req.body.postId, postBy: req.user._id })
                        if (userPost) {
                            await post.findOneAndUpdate({ _id: req.body.postId }, { $set: data })
                            res.send({
                                type: 'success',
                                message: 'Post update successfully'
                            })
                        } else {
                            res.send({
                                type: 'error',
                                message: 'You are not owner of this post'
                            })
                        }
                    }
                })
            }
        }
    } catch (error) {
        res.send({
            type: "error",
            message: error.message
        })
    }
})

router.post('/', async (req, res, next) => {
    try {
        upload(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                res.send({
                    type: 'error',
                    message: "Max file size 2MB allowed!"
                })
            } else if (err) {
                res.send({
                    type: 'error',
                    message: err.message
                })
            } else {
                req.body.postImg = req.file.filename
                req.body.postBy = req.user._id
                await post.create(req.body)
                res.send({
                    type: 'success',
                    message: 'post upload successfully'
                })
            }
        })
    } catch (error) {
        res.send({
            type: 'error',
            message: "Something when wrong"
        })
    }
})

module.exports = router;