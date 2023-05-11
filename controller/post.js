const post = require('../models/post');
const mongoose = require('mongoose');

/** this controller use for unAuth user Landing page */
module.exports.allPosts = function (req) {

    let cond = { isArchive: false }
    const sortPost = req.query.sortPost;
    const searchVal = req.query.searchVal;
    const limit = 4;
    const skip = (req.query.page - 1) * limit | 0;

    /** for searching post */
    let searchCond = {
        $or: [
            {
                title: { $regex: searchVal },
            },
            {
                desc: { $regex: searchVal }
            }
        ]
    }
    if (searchVal) {
        cond = {
            ...searchCond
        }
    }

    /** for sorting post */
    let sortCond = {}
    if (sortPost == 'title') {
        sortCond.title = -1
    } else {
        sortCond._id = -1
    }

    return post.aggregate([
        {
            $match: cond
        },
        {
            $sort: sortCond
        },
        {
            $skip: skip
        },
        {
            $limit: limit
        },
        {
            $lookup: {
                from: "users",
                localField: "postBy",
                foreignField: "_id",
                pipeline: [{
                    $project: {
                        'first_name': 1,
                        'last_name': 1,
                        'email': 1,
                        'profile': 1,
                        'createdOn': 1
                    }
                }],
                as: "user"
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "postId",
                as: "totalLikes"
            }
        },
        {
            $project: {
                title: 1,
                desc: 1,
                postImg: 1,
                isSaved: 1,
                isArchive: 1,
                isDeleted: 1,
                postBy: { $arrayElemAt: ['$user', 0] },
                totalLikes: { $size: "$totalLikes" }
            }
        }
    ]);
}

/** this controller use for authUser Timeline page */
module.exports.posts = function (req) {

    let cond = { isArchive: false }

    const filterPost = req.query.filterPost;
    const sortPost = req.query.sortPost;
    const searchVal = req.query.searchVal;
    const limit = 4;
    const skip = (req.query.page - 1) * limit | 0;

    /** for searching post */
    let searchCond = {
        $or: [
            {
                title: { $regex: searchVal },
            },
            {
                desc: { $regex: searchVal }
            }
        ]
    }
    if (searchVal) {
        cond = {
            ...searchCond
        }
    }

    /** for sorting post */
    let sortCond = {}
    if (sortPost == 'title') {
        sortCond.title = -1
    } else {
        sortCond._id = -1
    }

    /** for filter post */
    if (filterPost == 'mine') {
        cond.isArchive = false
        cond.postBy = new mongoose.Types.ObjectId(req.user._id)
    } else if (filterPost == 'other') {
        cond.isArchive = false
        cond.postBy = { $ne: new mongoose.Types.ObjectId(req.user._id) }
    } else {
        cond.isArchive = false
    }

    /** for archive post */
    if (req.params.archived) {
        cond = { isArchive: true, postBy: new mongoose.Types.ObjectId(req.user._id) }
    }

    const aggQuery = [
        {
            $match: cond
        },
        {
            $sort: sortCond
        },
        {
            $skip: skip
        },
        {
            $limit: limit
        },
        {
            $lookup: {
                from: "users",
                localField: "postBy",
                foreignField: "_id",
                pipeline: [{
                    $project: {
                        first_name: 1,
                        last_name: 1,
                        email: 1,
                        profile: 1,
                    }
                }],
                as: "user"
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "postId",
                as: "totalLikes"
            }
        },
        {
            $lookup: {
                from: "save_post",
                let: {
                    "postId": "$_id",
                },
                pipeline: [{
                    $match: {
                        $expr: {
                            $and: [{
                                $eq: ["$saveBy", new mongoose.Types.ObjectId(req.user._id)]
                            },
                            {
                                $eq: ["$postId", "$$postId"]
                            }]
                        }
                    }
                },
                {
                    $project: { _id: 1 }
                }],
                as: "saved"
            }
        },
        {
            $lookup: {
                from: "likes",
                let: {
                    "postId": "$_id",
                },
                pipeline: [{
                    $match: {
                        $expr: {
                            $and: [{
                                $eq: ["$likeBy", new mongoose.Types.ObjectId(req.user._id)]
                            },
                            {
                                $eq: ["$postId", "$$postId"]
                            }]
                        }
                    }
                },
                {
                    $project: { _id: 1 }
                }],
                as: "liked"
            }
        },
        {
            $project: {
                title: 1,
                desc: 1,
                postImg: 1,
                isArchive: 1,
                createdOn: 1,
                postBy: {
                    $arrayElemAt: ["$user", 0]
                },
                saved: { $size: "$saved" },
                liked: { $size: "$liked" },
                totalLikes: { $size: "$totalLikes" }
            }
        }
    ]

    return post.aggregate(aggQuery)
}

module.exports.post = function (req) {

    return post.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(req.query.postId) }
        },
        {
            $lookup: {
                from: "users",
                localField: "postBy",
                foreignField: "_id",
                pipeline: [{
                    $project: {
                        first_name: 1,
                        last_name: 1,
                        email: 1,
                        profile: 1,
                    }
                }],
                as: "user"
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "postId",
                as: "totalLikes"
            }
        },
        {
            $lookup: {
                from: 'comments',
                localField: '_id',
                foreignField: 'postId',
                pipeline: [
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'commentBy',
                            foreignField: '_id',
                            pipeline: [{
                                $project: {
                                    full_name: 1,
                                    profile: 1
                                }
                            }],
                            as: 'commentUser'
                        }
                    },
                    {
                        $match: { parent: { $exists: false } }
                    },
                    {
                        $sort: { createdOn: -1 }
                    },
                    {
                        $lookup: {
                            from: 'comments',
                            localField: '_id',
                            foreignField: 'parent',
                            pipeline: [
                                {
                                    $sort: { createdOn: -1 }
                                },
                                {
                                    $lookup: {
                                        from: 'users',
                                        localField: 'commentBy',
                                        foreignField: '_id',
                                        pipeline: [{
                                            $project: {
                                                full_name: 1,
                                                profile: 1
                                            }
                                        }],
                                        as: 'subCommentUser'
                                    },
                                },
                                {
                                    $project: {
                                        commentBy: 1,
                                        postId: 1,
                                        comment: 1,
                                        createdOn: 1,
                                        subCommentUser: { $arrayElemAt: ['$subCommentUser', 0] }
                                    }
                                }],
                            as: 'subComment'
                        }
                    },
                    {
                        $project: {
                            commentBy: 1,
                            postId: 1,
                            comment: 1,
                            createdOn: 1,
                            commentUser: { $arrayElemAt: ['$commentUser', 0] },
                            subComment: 1
                        }
                    }
                ],
                as: 'comment'
            }
        },
        {
            $project: {
                title: 1,
                desc: 1,
                postImg: 1,
                isArchive: 1,
                createdOn: 1,
                postBy: {
                    $arrayElemAt: ["$user", 0]
                },
                comments: '$comment',
                totalLikes: { $size: "$totalLikes" },
            }
        }
    ])

}
