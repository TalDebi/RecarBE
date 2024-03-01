import mongoose, { Schema } from "mongoose";

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

commentSchema.pre("deleteOne", { document: true }, async function (next) {
    for (let commentId of this.replies) {
        // needed because commentModel is not declared yet
        await mongoose.model('Comment').deleteOne({ _id: commentId });
    }
    next();
})


export default mongoose.model<Comment>("Comment", commentSchema);