const mongoose = require('mongoose');

let options = {
    collection: 'posts',
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'updatedOn'
    }
};

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        max: 30
    },
    desc: {
        type: String,
        required: true,
        max: 300
    },
    postImg: {
        type: String,
        required: true
    },
    postBy: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'users'
    },
    isSaved: {
        type: Boolean,
        default: false
    },
    isArchive: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, options)

module.exports = mongoose.model('posts', postSchema);