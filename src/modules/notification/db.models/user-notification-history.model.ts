import { Schema, Types, model, SchemaTimestampsConfig } from 'mongoose'


const UserNotificationHistorySchema = new Schema({
    userId: {
        type: Schema.Types.String,
        required: true,
    },
}, { timestamps: true })

export interface IUserNotificationHistory extends SchemaTimestampsConfig {
    _id: Types.ObjectId
    userId: string
}

export default model('UserNotificationHistory', UserNotificationHistorySchema)