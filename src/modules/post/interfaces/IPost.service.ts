import { IHashtag } from '../db.models/hashtag.model'
import { IPost } from '../db.models/post.model'
import { IPostLike } from '../db.models/post-like.model'
import { IPostSave } from '../db.models/post-save.model'
import { IComment } from '../db.models/comment.model'
import { ICommentLike } from '../db.models/comment-like.model'
import {
    CreatePostDto,
    FindFollowedUsersPostsDto,
    FindUsersWhoLikedPostDto,
    CreateCommentDto,
    FindCommentsForPostDto,
    FindUsersWhoLikedCommentDto,
    FindCommentRepliesDto,
    FindPostsForUserDto,
} from '../dtos'
import {
    FollowedUsersPosts,
    UsersWhoLikedPost,
    CommentsForPost,
    UsersWhoLikedComment,
    CommentReplies,
    PostDetails,
} from '../graphql.models'


export interface IPostService {

    createPost(createPostDto: CreatePostDto, userId: string): Promise<IPost>

    createComment(createCommentDto: CreateCommentDto, userId: string): Promise<IComment>

    findFollowedUsersPosts(findFollowedUsersPostsDto: FindFollowedUsersPostsDto, userId: string): Promise<FollowedUsersPosts>

    findHashtagsBySearchQuery(searchQuery: string, limit: number): Promise<IHashtag[]>

    likePost(postId: string, userId: string): Promise<IPostLike>

    unlikePost(postId: string, userId: string): Promise<IPostLike>

    savePost(postId: string, userId: string): Promise<IPostSave>

    unsavePost(postId: string, userId: string): Promise<IPostSave>

    likeComment(commentId: string, userId: string): Promise<ICommentLike>

    unlikeComment(commentId: string, userId: string): Promise<ICommentLike>

    findUsersWhoLikedPost(findUsersWhoLikedPostDto: FindUsersWhoLikedPostDto, userId: string): Promise<UsersWhoLikedPost>

    findCommentsForPost(findCommentsForPostDto: FindCommentsForPostDto, userId: string): Promise<CommentsForPost>

    findUsersWhoLikedComment(findUsersWhoLikedCommentDto: FindUsersWhoLikedCommentDto, userId: string): Promise<UsersWhoLikedComment>

    findCommentReplies(findCommentRepliesDto: FindCommentRepliesDto, userId: string): Promise<CommentReplies>

    findPostDetailsById(postId: string, userId: string): Promise<PostDetails | null>

    findPostsForUser(findPostsForUserDto: FindPostsForUserDto): Promise<IPost[]>
}