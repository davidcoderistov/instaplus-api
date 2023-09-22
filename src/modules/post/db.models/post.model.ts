import { Schema, Types, model, SchemaTimestampsConfig } from 'mongoose'
import { IUser } from '../../user/db.models/user.model'


const PostSchema = new Schema({
    caption: {
        type: Schema.Types.String,
        default: null,
    },
    location: {
        type: Schema.Types.String,
        default: null,
    },
    photoUrls: {
        type: [Schema.Types.String],
        required: true,
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
            firstName: {
                type: Schema.Types.String,
                required: true,
            },
            lastName: {
                type: Schema.Types.String,
                required: true,
            },
            photoUrl: Schema.Types.String,
        },
        required: true,
    },
}, { timestamps: true })

PostSchema.index({ createdAt: -1 })
PostSchema.index({ createdAt: -1, _id: -1 })

export interface IPost extends SchemaTimestampsConfig {
    _id: Types.ObjectId
    caption: string | null
    location: string | null
    photoUrls: string[]
    creator: Pick<IUser, '_id' | 'firstName' | 'lastName' | 'username' | 'photoUrl'>
}

export default model('Post', PostSchema)