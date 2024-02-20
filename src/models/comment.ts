import mongoose, { Schema } from "mongoose";
import { User } from "./user";

export interface Comment {
    _id?: Schema.Types.ObjectId;
    user: Schema.Types.ObjectId | User;
    text: String;
    replies: Schema.Types.ObjectId[] | Comment[]
}

const commentSchema = new Schema<Comment>({
    _id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        required: true
    },
    text: {
        type: String,
        required: true,
    },
    replies: {
        type: [Schema.Types.ObjectId],
        required: true,
        ref: 'Comment',
        default: []
    }

});

export default mongoose.model<Comment>("Comment", commentSchema);
