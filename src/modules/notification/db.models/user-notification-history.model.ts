import { Schema, Types, model, SchemaTimestampsConfig } from 'mongoose'


const UserNotificationHistorySchema = new Schema({
    userId: {
        type: Schema.Types.String,
        required: true,
    },
    seenAt: {
        type: Schema.Types.Date,
        required: true,
    },
}, { timestamps: true })

export interface IUserNotificationHistory extends SchemaTimestampsConfig {
    _id: Types.ObjectId
    userId: string
    seenAt: Date
}

export default model('UserNotificationHistory', UserNotificationHistorySchema)