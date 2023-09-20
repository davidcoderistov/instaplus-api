import { Schema, Types, model, SchemaTimestampsConfig } from 'mongoose'


const NotificationSchema = new Schema({
    type: {
        type: Schema.Types.String,
        enum: ['follow', 'like', 'comment'],
        required: true,
    },
    userId: {
        type: Schema.Types.String,
        required: true,
    },
    user: {
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
}, { timestamps: true })

const FollowNotificationSchema = new Schema({})

const PostNotificationSchema = new Schema({
    post: {
        type: {
            _id: {
                type: Schema.Types.ObjectId,
                required: true,
            },
            photoUrls: {
                type: [Schema.Types.String],
                required: true,
            },
        },
        required: true,
    },
})

export const Notification = model('Notification', NotificationSchema)
export const FollowNotification = Notification.discriminator('follow', FollowNotificationSchema)
export const PostLikeNotification = Notification.discriminator('like', PostNotificationSchema)
export const PostCommentNotification = Notification.discriminator('comment', PostNotificationSchema)

interface IBaseNotification extends SchemaTimestampsConfig {
    _id: Types.ObjectId,
    userId: string
    user: {
        _id: Types.ObjectId,
        username: string,
        photoUrl: string | null
    }
}

interface IPostNotification extends IBaseNotification {
    post: {
        _id: Types.ObjectId,
        photoUrls: string[]
    }
}

export interface IFollowNotification extends IBaseNotification {
    type: 'follow'
}

export interface IPostLikeNotification extends IPostNotification {
    type: 'like'
}

export interface IPostCommentNotification extends IPostNotification {
    type: 'comment'
}

export type INotification = IFollowNotification | IPostLikeNotification | IPostCommentNotification