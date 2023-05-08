const mongoose = require('mongoose');

let options = {
    collection: 'follows',
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'updatedOn'
    }
};

const followSchema = new mongoose.Schema({
    followingId: {
        type: mongoose.Types.ObjectId,
        ref: 'users'
    },
    followerId: {
        type: mongoose.Types.ObjectId,
        ref: 'users'
    },
    status: {
        type: String,
        enum: ['following', 'requested'],
        default: 'requested'
    }
}, options)

module.exports = mongoose.model('follows', followSchema);