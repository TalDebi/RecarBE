import mongoose, { Schema } from "mongoose";
import { Car } from "./car";
import { User } from "./user";

export interface Post {
  _id?: Schema.Types.ObjectId | string
  car: Car | string;
  publisher: User | string;
  comments?: (Schema.Types.ObjectId | string)[];
}

const postSchema = new Schema<Post>({
  car: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Car'
  },
  publisher: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  comments: {
    type: [Schema.Types.ObjectId],
    required: true,
    ref: 'Comment',
    default: []
  }
});

export default mongoose.model<Post>("Post", postSchema);
