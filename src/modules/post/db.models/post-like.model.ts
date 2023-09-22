import { Schema, model, SchemaTimestampsConfig } from 'mongoose'


const PostLikeSchema = new Schema({
    postId: {
        type: Schema.Types.String,
        required: true,
        ref: 'Post',
    },
    userId: {
        type: Schema.Types.String,
        required: true,
        ref: 'User',
    },
}, { timestamps: true })

PostLikeSchema.index({ postId: 1 })
PostLikeSchema.index({ createdAt: -1, _id: -1 })

export interface IPostLike extends SchemaTimestampsConfig {
    postId: string
    userId: string
}

export default model('PostLike', PostLikeSchema)