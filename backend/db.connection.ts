import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const dbconnection = async () => {
    try {
        const connection = await mongoose.connect(process.env.DATABASE_URI || '');
        console.log(`MongoDB connected: ${connection.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
};

export default dbconnection;