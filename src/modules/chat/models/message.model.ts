import { Schema, model, SchemaTimestampsConfig, Error, Types } from 'mongoose'
import { IUser } from '../../user/user.model'


const MessageSchema = new Schema({
    chatId: {
        type: Schema.Types.String,
        required: true,
        ref: 'Chat',
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
            photoUrl: {
                type: Schema.Types.String,
                required: true,
            },
        },
        required: true,
    },
    text: Schema.Types.String,
    photoUrl: Schema.Types.String,
    photoOrientation: Schema.Types.String,
    videoUrl: Schema.Types.String,
    seenByUserIds: [{
        type: Schema.Types.String,
        ref: 'User',
    }],
    reply: {
        _id: Schema.Types.ObjectId,
        creator: {
            _id: Schema.Types.ObjectId,
            username: Schema.Types.String,
            photoUrl: Schema.Types.String,
        },
        text: Schema.Types.String,
        photoUrl: Schema.Types.String,
        photoOrientation: Schema.Types.String,
        videoUrl: Schema.Types.String,
    },
    reactions: [
        {
            reaction: {
                type: Schema.Types.String,
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
                    photoUrl: {
                        type: Schema.Types.String,
                        required: true,
                    },
                },
                required: true,
            },
        },
    ],
}, { timestamps: true })

MessageSchema.pre('validate', function(next) {
    if ((this.text && this.photoUrl) || (!this.text && !this.photoUrl)) {
        return next(new Error('At least and only one field(text, photoUrl) should be present'))
    }
    next()
})

interface IReaction {
    reaction: string
    creator: Pick<IUser, '_id' | 'username' | 'firstName' | 'lastName' | 'photoUrl'>
}

interface IBaseMessage {
    _id: Types.ObjectId
    chatId: string
    creator: Pick<IUser, '_id' | 'username' | 'photoUrl'>
    text?: string
    photoUrl?: string
    photoOrientation?: string
    videoUrl?: string
    seenByUserIds: string[]
    reactions: IReaction[]
}

export interface IMessage extends IBaseMessage, SchemaTimestampsConfig {
    reply?: Pick<IBaseMessage, '_id' | 'creator' | 'text' | 'photoUrl' | 'photoOrientation' | 'videoUrl'>
}

export default model('Message', MessageSchema)