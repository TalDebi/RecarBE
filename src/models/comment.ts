import mongoose, { Schema } from "mongoose";

export interface Comment {
  _id?: Schema.Types.ObjectId;
  publisher: Schema.Types.ObjectId;
  text: String;
  replies?: Schema.Types.ObjectId[];
}

const commentSchema = new Schema<Comment>({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: new mongoose.Types.ObjectId(),
  },
  publisher: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  text: {
    type: String,
    required: true,
  },
  replies: {
    type: [Schema.Types.ObjectId],
    ref: "Comment",
    default: [],
  },
});

commentSchema.pre("deleteOne", { document: true }, async function (next) {
  for (let replyId of this.replies) {
    // needed because commentModel is not declared yet

    const oldDocument = await mongoose.model("Comment").findById(replyId);
    oldDocument !== null && (await oldDocument.deleteOne());
  }
  next();
});

export default mongoose.model<Comment>("Comment", commentSchema);
