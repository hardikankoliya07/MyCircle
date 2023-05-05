const Comment = require('../models/comments');
const mongoose = require('mongoose');

module.exports.comments = function (postId) {
    return Comment.aggregate([
        {
            $match: { postId: new mongoose.Types.ObjectId(postId), parent: { $exists: false } }
        },
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
                as: 'commentUser'
            }
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
                subComment: 1,
                commentUser: { $arrayElemAt: ['$commentUser', 0] }
            }
        }
    ]);
}