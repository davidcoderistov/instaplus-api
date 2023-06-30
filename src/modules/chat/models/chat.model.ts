import { Schema, Types, model, SchemaTimestampsConfig } from 'mongoose'
import { IUser } from '../../user/user.model'


const ChatSchema = new Schema({
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
            photoUrl: {
                type: Schema.Types.String,
                required: true,
            },
        },
        required: true,
    },
    chatMembers: {
        type: [
            {
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
                photoUrl: {
                    type: Schema.Types.String,
                    required: true,
                },
            },
        ],
        required: true,
    },
}, { timestamps: true })

type IChatUser = Pick<IUser, '_id' | 'username' | 'firstName' | 'lastName' | 'photoUrl'>

export interface IChat extends SchemaTimestampsConfig {
    _id: Types.ObjectId
    creator: IChatUser
    chatMembers: IChatUser[]
}

export default model('Chat', ChatSchema)