const mongoose = require('mongoose');

let options = {
    collection: 'likes',
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'updatedOn'
    }
};

const likeSchema = new mongoose.Schema({
    likeBy: {
        type: mongoose.Types.ObjectId,
        ref: 'users'
    },
    postId: {
        type: mongoose.Types.ObjectId,
        ref: 'posts'
    }
}, options)

module.exports = mongoose.model('likes', likeSchema);