const user = require('../models/user');
const mongoose = require('mongoose')

module.exports.report = function (req) {
    return user.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: 'posts',
                localField: '_id',
                foreignField: 'postBy',
                pipeline: [{
                    $match: {
                        isArchive: false
                    }
                }],
                as: 'userPost'
            }
        },
        {
            $lookup: {
                from: 'save_post',
                localField: '_id',
                foreignField: 'saveBy',
                as: 'savedPost'
            }
        },
        {
            $project: {
                createdPost: { $size: "$userPost" },
                savedPost: { $size: "$savedPost" }
            }
        }
    ])
}