import { Schema, model, SchemaTimestampsConfig } from 'mongoose'


const HashtagPostSchema = new Schema({
    hashtagId: {
        type: Schema.Types.String,
        required: true,
    },
    postId: {
        type: Schema.Types.String,
        required: true,
    },
}, { timestamps: true })

export interface IHashtagPost extends SchemaTimestampsConfig {
    hashtagId: string
    postId: string
}

export default model('HashtagPost', HashtagPostSchema)