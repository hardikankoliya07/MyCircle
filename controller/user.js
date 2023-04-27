const user = require('../models/user');

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
            $match: searchCond
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
            $project: {
                first_name: 1,
                last_name: 1,
                email: 1,
                profile: 1,
                createdPost: { $size: "$userPost" },
                savedPost: { $size: "$savedPost" }
            }
        }
    ])
}