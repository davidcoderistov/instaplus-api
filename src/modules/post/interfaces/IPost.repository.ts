import { IPost } from '../db.models/post.model'
import { IHashtag } from '../db.models/hashtag.model'
import { IHashtagPost } from '../db.models/hashtag-post.model'
import { IUser } from '../../user/db.models/user.model'
import { IPostLike } from '../db.models/post-like.model'
import { IPostSave } from '../db.models/post-save.model'
import { IComment } from '../db.models/comment.model'
import { ICommentLike } from '../db.models/comment-like.model'
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

    findPostById(postId: string): Promise<IPost | null>

    findPostLike(postId: string, userId: string): Promise<IPostLike | null>

    createPostLike(postId: string, userId: string): Promise<IPostLike>

    deletePostLike(postId: string, userId: string): Promise<IPostLike | null>

    findPostSave(postId: string, userId: string): Promise<IPostSave | null>

    createPostSave(postId: string, userId: string): Promise<IPostSave>

    deletePostSave(postId: string, userId: string): Promise<IPostSave | null>

    findCommentById(commentId: string): Promise<IComment | null>

    findCommentLike(commentId: string, userId: string): Promise<ICommentLike | null>

    createCommentLike(commentId: string, userId: string): Promise<ICommentLike>

    deleteCommentLike(commentId: string, userId: string): Promise<ICommentLike | null>
}