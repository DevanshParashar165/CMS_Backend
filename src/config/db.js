import mongoose from "mongoose";

export const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        console.error('Error: MONGO_URI is not defined in the environment. Add it to .env and restart the app.');
        process.exit(1);
    }

    try {
        const conn = await mongoose.connect(mongoUri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};
