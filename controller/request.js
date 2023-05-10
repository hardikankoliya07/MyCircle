const Follow = require('../models/follow');
const { ObjectId } = require('mongoose').Types;

module.exports.request = function (req) {

    return Follow.aggregate([
        {
            $match: { followerId: new ObjectId(req.user._id) }
        },
        {
            $sort: { createdOn: -1 }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'followingId',
                foreignField: '_id',
                pipeline: [{
                    $project: {
                        profile: 1,
                        full_name: 1,
                    }
                }],
                as: 'requestUser'
            }
        },
        {
            $project: {
                followerId: 1,
                createdOn: 1,
                followingId: 1,
                status: 1,
                requestUser: { $arrayElemAt: ["$requestUser", 0] }
            }
        }
    ])

}