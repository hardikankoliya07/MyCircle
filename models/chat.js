const mongoose = require('mongoose');

let options = {
    collection: 'chats',
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'updatedOn'
    }
};

const chatSchema = new mongoose.Schema({
    sendBy: {
        type: mongoose.Types.ObjectId,
        ref: 'users'
    },
    receiveBy: {
        type: mongoose.Types.ObjectId,
        ref: 'users'
    },
    message: {
        type: String
    }
}, options)

module.exports = mongoose.model('chats', chatSchema);