import mongoose from "mongoose";

export interface User {
  _id?: string;
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  imgUrl?: string;
  refreshTokens?: string[];
  likedPosts?: string[];
}

const userSchema = new mongoose.Schema<User>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
  },
  imgUrl: {
    type: String,
  },
  refreshTokens: {
    type: [String],
  },
  likedPosts: {
    type: [String],
  },
});

export default mongoose.model<User>("User", userSchema);
