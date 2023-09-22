import { Schema, Types, model, SchemaTimestampsConfig } from 'mongoose'


const HashtagSchema = new Schema({
    name: {
        type: Schema.Types.String,
        required: true,
        unique: true,
    },
    postsCount: {
        type: Schema.Types.Number,
        required: true,
    },
}, { timestamps: true })

export interface IHashtag extends SchemaTimestampsConfig {
    _id: Types.ObjectId
    name: string
}

export default model('Hashtag', HashtagSchema)