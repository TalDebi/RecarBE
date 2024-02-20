import mongoose, { Schema } from "mongoose";
import { Comment } from "./comment";
import { Car } from "./car";
import { User } from "./user";

export interface Post {
  _id?: Schema.Types.ObjectId
  car: Car;
  publisher: User;
  comments: Schema.Types.ObjectId[] | Comment[];
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

export default mongoose.model<Post>("StudentPost", postSchema);
