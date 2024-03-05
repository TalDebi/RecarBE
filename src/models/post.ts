import mongoose, { Schema } from "mongoose";
import { Car } from "./car";
import { User } from "./user";
import CommentModel from "./comment";
import CarModel from "./car";

export interface Post {
  _id?: Schema.Types.ObjectId;
  car: Car | string;
  publisher: User | string;
  comments?: Schema.Types.ObjectId[];
}

const postSchema = new Schema<Post>({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: new mongoose.Types.ObjectId(),
  },
  car: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Car",
  },
  publisher: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  comments: {
    type: [Schema.Types.ObjectId],
    ref: "Comment",
    default: [],
  },
});

postSchema.pre("deleteOne", { document: true }, async function (next) {
  for (let commentId of this.comments) {    const oldDocument = await CommentModel.findById(commentId);
    oldDocument !== null && (await oldDocument.deleteOne());
  }
  const oldDocument = await CarModel.findById(this.car);
  oldDocument !== null && (await oldDocument.deleteOne());

  next();
});

export default mongoose.model<Post>("Post", postSchema);
