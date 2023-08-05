import { IPost } from '../db.models/post.model'
import { IHashtag } from '../db.models/hashtag.model'
import { IHashtagPost } from '../db.models/hashtag-post.model'
import { IUser } from '../../user/db.models/user.model'
import { CreatePostDto } from '../dtos'


export interface IPostRepository {

    createPost(
        createPostDto: Pick<CreatePostDto, 'caption' | 'location'>,
        photoUrls: string[],
        creator: Pick<IUser, '_id' | 'firstName' | 'lastName' | 'username' | 'photoUrl'>): Promise<IPost>

    createHashtag(name: string, postId: string): Promise<IHashtag>

    createHashtagPost(hashtagId: string, postId: string): Promise<IHashtagPost>

    findHashtagsBySearchQuery(searchQuery: string, limit: number): Promise<IHashtag[]>

    findHashtagById(id: string): Promise<IHashtag | null>

    findHashtagsByIds(ids: string[], limit: number): Promise<IHashtag[]>

    findHashtagsByNames(names: string[]): Promise<IHashtag[]>
}