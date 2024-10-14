const mongoose = require('mongoose');
const connectDB = async () => {
    try {
        mongoose.set('strictQuery', false);
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected : ${ conn.connection.host }`);
    } catch (error) {
        console.error(error);
    }
}


module.exports = connectDB;