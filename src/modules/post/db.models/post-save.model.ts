import { Schema, model, SchemaTimestampsConfig } from 'mongoose'


const PostSaveSchema = new Schema({
    postId: {
        type: Schema.Types.String,
        required: true,
        ref: 'Post',
    },
    userId: {
        type: Schema.Types.String,
        required: true,
        ref: 'User',
    },
}, { timestamps: true })

export interface IPostSave extends SchemaTimestampsConfig {
    postId: string
    userId: string
}

export default model('PostSave', PostSaveSchema)