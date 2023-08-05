import { IHashtag } from '../db.models/hashtag.model'
import { IPost } from '../db.models/post.model'
import { CreatePostDto } from '../dtos'


export interface IPostService {

    createPost(createPostDto: CreatePostDto, userId: string): Promise<IPost>

    findHashtagsBySearchQuery(searchQuery: string, limit: number): Promise<IHashtag[]>
}