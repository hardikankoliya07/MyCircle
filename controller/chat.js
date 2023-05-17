const User = require('../models/user');
const mongoose = require('mongoose');

module.exports.chat = function (req) {
    return User.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(req.body.uId) }
        },
        {
            $lookup: {
                from: "chats",
                let: {
                    "sendBy": "$_id",
                },
                pipeline: [
                    {
                        $sort: { _id: -1 }
                    },
                    {
                        $limit: 25
                    },
                    {
                        $match: {
                            $expr: {
                                $and: [{
                                    $or: [{
                                        $eq: ["$receiveBy", new mongoose.Types.ObjectId(req.user._id)]
                                    },
                                    {
                                        $eq: ["$receiveBy", '$$sendBy']
                                    }]
                                },
                                {
                                    $or: [{
                                        $eq: ["$sendBy", "$$sendBy"]
                                    },
                                    {
                                        $eq: ["$sendBy", new mongoose.Types.ObjectId(req.user._id)]
                                    }]
                                }]
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            sendBy: 1,
                            receiveBy: 1,
                            message: 1,
                            createdAt: 1
                        }
                    }],
                as: "messages"
            }
        },
        {
            $project: {
                _id: 1,
                full_name: 1,
                profile: 1,
                messages: '$messages'
            }
        }
    ]);
}