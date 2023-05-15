const user = require('../models/user');
const { ObjectId } = require('mongoose').Types;

/** controller use for user list */
module.exports.user = function (req) {
    const searchVal = req.query.searchUser;
    let searchCond = {};
    if (searchVal) {
        searchCond = {
            $or: [
                {
                    first_name: { $regex: searchVal },
                },
                {
                    last_name: { $regex: searchVal }
                },
                {
                    full_name: { $regex: searchVal }
                },
                {
                    email: { $regex: searchVal }
                }
            ]
        }
    }

    return user.aggregate([
        {
            $match: { _id: { $ne: new ObjectId(req.user._id) }, ...searchCond }
        },
        {
            $sort: { createdOn: -1 }
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
            $lookup: {
                from: "follows",
                let: {
                    "followerId": "$_id",
                },
                pipeline: [{
                    $match: {
                        $expr: {
                            $and: [{
                                $eq: ["$followingId", new ObjectId(req.user._id)]
                            },
                            {
                                $eq: ["$followerId", "$$followerId"]
                            }]
                        }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        createdOn: 1,
                        status: 1,
                        followingId: 1,
                        followerId: 1
                    }
                }],
                as: "follow"
            }
        },
        {
            $project: {
                first_name: 1,
                last_name: 1,
                email: 1,
                profile: 1,
                gender: 1,
                account_status: 1,
                createdPost: { $size: "$userPost" },
                savedPost: { $size: "$savedPost" },
                follows: { $arrayElemAt: ['$follow', 0] }
            }
        }
    ])
}