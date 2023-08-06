import { IHashtag } from '../db.models/hashtag.model'
import { IPost } from '../db.models/post.model'
import { IPostLike } from '../db.models/post-like.model'
import { CreatePostDto } from '../dtos'


export interface IPostService {

    createPost(createPostDto: CreatePostDto, userId: string): Promise<IPost>

    findHashtagsBySearchQuery(searchQuery: string, limit: number): Promise<IHashtag[]>

    likePost(postId: string, userId: string): Promise<IPostLike>

    unlikePost(postId: string, userId: string): Promise<IPostLike>

    savePost(postId: string, userId: string): Promise<IPostLike>
}