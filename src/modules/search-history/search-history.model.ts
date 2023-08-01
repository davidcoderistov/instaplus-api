import { Schema, model, SchemaTimestampsConfig, Error, Types } from 'mongoose'


const SearchHistorySchema = new Schema({
    searchingUserId: {
        type: Schema.Types.String,
        required: true,
        ref: 'User',
    },
    searchedUserId: {
        type: Schema.Types.String,
        ref: 'User',
        default: null,
    },
    searchedHashtagId: {
        type: Schema.Types.String,
        ref: 'Hashtag',
        default: null,
    },
}, { timestamps: true })

SearchHistorySchema.pre('validate', function(next) {
    if ((this.searchedUserId && this.searchedHashtagId) || (!this.searchedUserId && !this.searchedHashtagId)) {
        return next(new Error('At least and only one field(searchedUserId, searchedHashtagId) should be present'))
    }
    next()
})

export interface ISearchHistory extends SchemaTimestampsConfig {
    _id: Types.ObjectId
    searchingUserId: string
    searchedUserId: string | null
    searchedHashtagId: string | null
}

export default model('SearchHistory', SearchHistorySchema)