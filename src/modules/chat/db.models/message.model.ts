import { Schema, model, SchemaTimestampsConfig, Error, Types } from 'mongoose'
import { IUser } from '../../user/db.models/user.model'


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
            photoUrl: Schema.Types.String,
        },
        required: true,
    },
    text: {
        type: Schema.Types.String,
        default: null,
    },
    photoUrl: {
        type: Schema.Types.String,
        default: null,
    },
    photoOrientation: {
        type: Schema.Types.String,
        default: null,
    },
    previewPhotoUrl: {
        type: Schema.Types.String,
        default: null,
    },
    seenByUserIds: [{
        type: Schema.Types.String,
        ref: 'User',
    }],
    reply: {
        type: {
            _id: Schema.Types.ObjectId,
            creator: {
                _id: Schema.Types.ObjectId,
                username: Schema.Types.String,
                photoUrl: Schema.Types.String,
            },
            text: Schema.Types.String,
            photoUrl: Schema.Types.String,
            photoOrientation: Schema.Types.String,
            previewPhotoUrl: Schema.Types.String,
        },
        default: null,
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
                    photoUrl: Schema.Types.String,
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

MessageSchema.index({ chatId: 1 })
MessageSchema.index({ createdAt: -1, _id: -1 })

interface IReaction {
    reaction: string
    creator: Pick<IUser, '_id' | 'username' | 'firstName' | 'lastName' | 'photoUrl'>
}

interface IBaseMessage {
    _id: Types.ObjectId
    chatId: string
    creator: Pick<IUser, '_id' | 'username' | 'photoUrl'>
    text?: string | null
    photoUrl?: string | null
    photoOrientation?: string | null
    previewPhotoUrl?: string | null
    seenByUserIds: string[]
    reactions: IReaction[]
}

export interface IMessage extends IBaseMessage, SchemaTimestampsConfig {
    reply?: Pick<IBaseMessage, '_id' | 'creator' | 'text' | 'photoUrl' | 'photoOrientation' | 'previewPhotoUrl'> | null
}

export default model('Message', MessageSchema)