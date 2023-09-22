import { Schema, Types, model, SchemaTimestampsConfig } from 'mongoose'


const FollowSchema = new Schema({
    followingUserId: {
        type: Schema.Types.String,
        required: [true, 'Following user is required'],
        ref: 'User',
    },
    followedUserId: {
        type: Schema.Types.String,
        required: [true, 'Followed user is required'],
        ref: 'User',
    },
}, { timestamps: true })

FollowSchema.index({ followingUserId: 1 })
FollowSchema.index({ followedUserId: 1 })
FollowSchema.index({ createdAt: -1, _id: -1 })

export interface IFollow extends SchemaTimestampsConfig {
    _id: Types.ObjectId
    followingUserId: string
    followedUserId: string
}

export default model('Follow', FollowSchema)