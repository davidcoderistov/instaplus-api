import { IHashtag } from '../db.models/hashtag.model'


export interface IPostRepository {

    createHashtag(name: string, postId: string): Promise<IHashtag>

    findHashtagsBySearchQuery(searchQuery: string, limit: number): Promise<IHashtag[]>

    findHashtagById(id: string): Promise<IHashtag | null>
}