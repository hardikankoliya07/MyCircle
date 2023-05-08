const mongoose = require('mongoose');

let options = {
    collection: 'users',
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'updatedOn'
    }
};

const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    full_name: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    account_status: {
        type: String,
        enum: ['private', 'public'],
        default: 'private'
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
        required: true
    },
    profile: {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isVerify: {
        type: Boolean,
        default: false
    }
}, options)

userSchema.pre('save', async function (next) {
    this.full_name = this.first_name.concat(" ", this.last_name)
    next()
})

module.exports = mongoose.model('users', userSchema);