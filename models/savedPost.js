const mongoose = require('mongoose');

let options = {
    collection: 'save_post',
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'updatedOn'
    }
};

const postSchema = new mongoose.Schema({
    saveBy: {
        type: mongoose.Types.ObjectId,
        ref: 'users'
    },
    postId: {
        type: mongoose.Types.ObjectId,
        ref: 'posts'
    }
}, options)

module.exports = mongoose.model('save_post', postSchema);