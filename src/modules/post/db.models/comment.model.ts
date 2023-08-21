import { Schema, Types, model, SchemaTimestampsConfig } from 'mongoose'
import { IUser } from '../../user/db.models/user.model'


const CommentSchema = new Schema({
    text: {
        type: Schema.Types.String,
        required: [true, 'Comment text is required'],
    },
    creator: {
        type: {
            _id: {
                type: Schema.Types.ObjectId,
                required: true,
            },
            username: {
                type: Schema.Types.String,
                required: true,
            },
            photoUrl: Schema.Types.String,
        },
        required: true,
    },
    postId: {
        type: Schema.Types.String,
        required: [true, 'Post is required'],
        ref: 'Post',
    },
    commentId: {
        type: Schema.Types.String,
        default: null,
        ref: 'Comment',
    },
}, { timestamps: true })

export interface IComment extends SchemaTimestampsConfig {
    _id: Types.ObjectId
    text: string
    creator: Pick<IUser, '_id' | 'username' | 'photoUrl'>
    postId: string
    commentId: string
}

export default model('Comment', CommentSchema)