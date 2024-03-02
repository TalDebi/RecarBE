import mongoose, { Schema } from "mongoose";
import { Car } from "./car";
import { User } from "./user";
import commentModel from "./comment"

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

postSchema.pre("deleteOne", { document: true }, async function (next) {
  for (let commentId of this.comments) {
    await (await commentModel.findById(commentId)).deleteOne();
  }
  next();
})

export default mongoose.model<Post>("Post", postSchema);
