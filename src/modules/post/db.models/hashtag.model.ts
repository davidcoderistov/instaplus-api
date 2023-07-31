import { Schema, Types, model, SchemaTimestampsConfig } from 'mongoose'


const HashtagSchema = new Schema({
    name: {
        type: Schema.Types.String,
        required: true,
        unique: true,
    },
    postIds: {
        type: [Schema.Types.String],
        required: true,
    },
}, { timestamps: true })

export interface IHashtag extends SchemaTimestampsConfig {
    _id: Types.ObjectId
    name: string
    postIds: string[]
}

export default model('Hashtag', HashtagSchema)