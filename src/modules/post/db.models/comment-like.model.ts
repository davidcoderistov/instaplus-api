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

CommentLikeSchema.index({ commentId: 1 })
CommentLikeSchema.index({ createdAt: -1, _id: -1 })

export interface ICommentLike extends SchemaTimestampsConfig {
    commentId: string
    userId: string
}

export default model('CommentLike', CommentLikeSchema)