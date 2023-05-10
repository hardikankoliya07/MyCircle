const mongoose = require('mongoose');

let options = {
    collection: 'notifications',
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'updatedOn'
    }
};

const notificationSchema = new mongoose.Schema({
    notificationBy: {
        type: mongoose.Types.ObjectId,
        ref: 'users'
    },
    notificationFor: {
        type: mongoose.Types.ObjectId,
        ref: 'users'
    },
    isSeen: {
        type: Boolean,
        default: false
    },
    Message: {
        type: String
    }
}, options)

module.exports = mongoose.model('notifications', notificationSchema);