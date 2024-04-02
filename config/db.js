import mongoose from "mongoose";

const connectDb = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://adityagaikwad314:nvEy73wLeDvLagMy@cluster0.itwgpks.mongodb.net",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log(`Connected To MongoDB Database`);
  } catch (error) {
    console.log(`Error in MongoDB ${error}`);
  }
};

export default connectDb;
