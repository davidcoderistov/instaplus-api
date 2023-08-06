import { Schema, model, SchemaTimestampsConfig } from 'mongoose'


const CommentLikeSchema = new Schema({
    commentId: {
        type: Schema.Types.String,
        required: true,
        ref: 'Comment',
    },
    userId: {
        type: Schema.Types.String,
        required: true,
        ref: 'User',
    },
}, { timestamps: true })

export interface ICommentLike extends SchemaTimestampsConfig {
    commentId: string
    userId: string
}

export default model('CommentLike', CommentLikeSchema)