const mongoose = require('mongoose')
module.exports = () => {
    try {
        const DB_URL = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
        // const DB_URL = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
        mongoose.connect(DB_URL).connection;
        console.log("DB Connected...");
    } catch (error) {
        console.log(error);
    }
}