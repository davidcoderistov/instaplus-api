import { IHashtag } from '../db.models/hashtag.model'


export interface IPostService {

    findHashtagsBySearchQuery(searchQuery: string, limit: number): Promise<IHashtag[]>
}