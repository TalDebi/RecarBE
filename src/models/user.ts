import mongoose, { Schema } from "mongoose";
import { Post } from "./post";

export interface User {
  _id?: Schema.Types.ObjectId | string;
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  imgUrl?: string;
  refreshTokens?: string[];
  likedPosts?: (Post | string)[];
}

const userSchema = new mongoose.Schema<User>({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: new mongoose.Types.ObjectId(),
  },
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
    type: [Schema.Types.ObjectId],
    ref: "Post",
    default: [],
  },
});

export default mongoose.model<User>("User", userSchema);
