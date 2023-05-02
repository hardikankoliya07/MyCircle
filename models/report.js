const mongoose = require('mongoose');

let options = {
    collection: 'reports',
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'updatedOn'
    }
};

const reportSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'users'
    },
    TotalPost: {
        type: Number,
        default: 0,
    },
    userSaved: {
        type: Number,
        default: 0
    },
    otherSaved: {
        type: Number,
        default: 0
    },
}, options)
    
module.exports = mongoose.model('reports', reportSchema);