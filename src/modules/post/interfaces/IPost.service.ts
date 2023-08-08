import { IHashtag } from '../db.models/hashtag.model'
import { IPost } from '../db.models/post.model'
import { IPostLike } from '../db.models/post-like.model'
import { IPostSave } from '../db.models/post-save.model'
import { ICommentLike } from '../db.models/comment-like.model'
import { CreatePostDto, FindFollowedUsersPostsDto, FindUsersWhoLikedPostDto } from '../dtos'
import { FollowedUsersPosts, UsersWhoLikedPost } from '../graphql.models'


export interface IPostService {

    createPost(createPostDto: CreatePostDto, userId: string): Promise<IPost>

    findFollowedUsersPosts(findFollowedUsersPostsDto: FindFollowedUsersPostsDto, userId: string): Promise<FollowedUsersPosts>

    findHashtagsBySearchQuery(searchQuery: string, limit: number): Promise<IHashtag[]>

    likePost(postId: string, userId: string): Promise<IPostLike>

    unlikePost(postId: string, userId: string): Promise<IPostLike>

    savePost(postId: string, userId: string): Promise<IPostSave>

    unsavePost(postId: string, userId: string): Promise<IPostSave>

    likeComment(commentId: string, userId: string): Promise<ICommentLike>

    unlikeComment(commentId: string, userId: string): Promise<ICommentLike>

    findUsersWhoLikedPost(findUsersWhoLikedPostDto: FindUsersWhoLikedPostDto, userId: string): Promise<UsersWhoLikedPost>
}