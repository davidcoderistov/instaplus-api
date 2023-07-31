import { IHashtag } from '../db.models/hashtag.model'


export interface IPostRepository {

    createHashtag(name: string, postId: string): Promise<IHashtag>
}