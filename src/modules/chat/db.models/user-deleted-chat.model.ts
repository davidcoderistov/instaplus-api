import { Schema, model, SchemaTimestampsConfig } from 'mongoose'


const UserDeletedChatSchema = new Schema({
    userId: {
        type: Schema.Types.String,
        required: true,
    },
    chatId: {
        type: Schema.Types.String,
        required: true,
    },
}, { timestamps: true })

export interface IUserDeletedChat extends SchemaTimestampsConfig {
    userId: string
    chatId: string
}

export default model('UserDeletedChat', UserDeletedChatSchema)