import mongoose, { Schema } from "mongoose";
import { User } from "./user";

export interface Comment {
    _id?: Schema.Types.ObjectId;
    publisher: Schema.Types.ObjectId;
    text: String;
    replies?: Schema.Types.ObjectId[]
}

const commentSchema = new Schema<Comment>({
    publisher: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
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
