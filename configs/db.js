import mongoose from "mongoose";

const connectDB = async () => {
  let finalURI;
  if (process.env.NODE_ENV === "development") {
    finalURI = process.env.MONGO_URI_DEV;
  } else {
    finalURI = process.env.MONGO_URI_PROD;
  }
  try {
    const conn = await mongoose.connect(finalURI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
