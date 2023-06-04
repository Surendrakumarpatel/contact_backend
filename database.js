import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const dbConnection = () => {
    const connection = mongoose
        .connect(process.env.MONGODB_URI)
        .then(() => console.log("Connected to database"))
        .catch((err) => console.log(err));
    return connection;
}

export default dbConnection;