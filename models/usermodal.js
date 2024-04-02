import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  isSubAdmin: { type: Boolean, default: false },
  balance: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model("User", userSchema);
