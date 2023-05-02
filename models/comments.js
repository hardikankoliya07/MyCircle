const mongoose = require('mongoose');

let options = {
    collection: 'comments',
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'updatedOn'
    }
};

const commentSchema = new mongoose.Schema({
    commentBy: {
        type: mongoose.Types.ObjectId,
        ref: 'users'
    },
    postId: {
        type: mongoose.Types.ObjectId,
        ref: 'posts'
    },
    comment: {
        type: String
    }
}, options)

module.exports = mongoose.model('comments', commentSchema);