import { IPost } from '../db.models/post.model'
import { IHashtag } from '../db.models/hashtag.model'
import { IHashtagPost } from '../db.models/hashtag-post.model'
import { IUser } from '../../user/db.models/user.model'
import { IPostLike } from '../db.models/post-like.model'
import { IPostSave } from '../db.models/post-save.model'
import { IComment } from '../db.models/comment.model'
import { ICommentLike } from '../db.models/comment-like.model'
import {
    CreatePostDto,
    CreateCommentDto,
    FindFollowedUsersPostsDto,
    FindUsersWhoLikedPostDto,
    FindCommentsForPostDto,
    FindUsersWhoLikedCommentDto,
    FindCommentRepliesDto,
    FindPostsForUserDto,
    FindSavedPostsForUserDto,
    FindPostsForHashtagDto,
} from '../dtos'
import {
    FollowedUsersPosts,
    UsersWhoLikedPost,
    CommentsForPost,
    UsersWhoLikedComment,
    CommentReplies,
    PostDetails,
    PostsForUser,
    SavedPostsForUser,
    Hashtag,
    PostsForHashtag,
} from '../graphql.models'


export interface IPostRepository {

    createPost(
        createPostDto: Pick<CreatePostDto, 'caption' | 'location'>,
        photoUrls: string[],
        creator: Pick<IUser, '_id' | 'firstName' | 'lastName' | 'username' | 'photoUrl'>): Promise<IPost>

    createComment(createCommentDto: CreateCommentDto, creator: Pick<IUser, '_id' | 'username' | 'photoUrl'>): Promise<IComment>

    createHashtag(name: string): Promise<IHashtag>

    findHashtagByIdAndIncrementPostsCount(id: string): Promise<IHashtag | null>

    createHashtagPost(hashtagId: string, postId: string): Promise<IHashtagPost>

    findHashtagsBySearchQuery(searchQuery: string, limit: number): Promise<Hashtag[]>

    findHashtagById(id: string): Promise<IHashtag | null>

    findHashtagsByIds(ids: string[], limit: number): Promise<Hashtag[]>

    findHashtagsByNames(names: string[]): Promise<IHashtag[]>

    findPostById(postId: string): Promise<IPost | null>

    findPostByIdAndIncrementCommentsCount(postId: string): Promise<IPost | null>

    findFollowedUsersPosts(findFollowedUsersPostsDto: FindFollowedUsersPostsDto, userId: string): Promise<FollowedUsersPosts>

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

    findUsersWhoLikedPost(findUsersWhoLikedPostDto: FindUsersWhoLikedPostDto, userId: string): Promise<UsersWhoLikedPost>

    findCommentsForPost(findCommentsForPostDto: FindCommentsForPostDto, userId: string): Promise<CommentsForPost>

    findUsersWhoLikedComment(findUsersWhoLikedCommentDto: FindUsersWhoLikedCommentDto, userId: string): Promise<UsersWhoLikedComment>

    findCommentReplies(findCommentRepliesDto: FindCommentRepliesDto, userId: string): Promise<CommentReplies>

    findPostDetailsById(postId: string, userId: string): Promise<PostDetails | null>

    findPostsForUser(findPostsForUserDto: FindPostsForUserDto): Promise<PostsForUser>

    findPostsCount(userId: string): Promise<number>

    findSavedPostsForUser(findSavedPostsForUser: FindSavedPostsForUserDto, userId: string): Promise<SavedPostsForUser>

    findPostsForHashtag(hashtagId: string, findPostsForHashtagDto: Pick<FindPostsForHashtagDto, 'offset' | 'limit'>): Promise<PostsForHashtag>

    findLikedPostIdsByFollowersAndUser(userId: string, followedUsersIds: string[]): Promise<string[]>

    findLikedPostsCountsByFollowersAndUser(userId: string, followedUsersIds: string[], postLikesIds: string[]): Promise<{ _id: string, count: number }[]>

    findLikedCommentsCountsByFollowersAndUser(userId: string, followedUsersIds: string[], postLikesIds: string[]): Promise<{ _id: string, count: number }[]>

    findFollowedUsersPostsIds(userId: string, followedUsersIds: string[]): Promise<string[]>

    findLikedPostsCountsByFollowedConnections(followedUsersIds: string[], followedUsersPostsIds: string[]): Promise<{ _id: string, count: number }[]>

    findSavedPostsCountsByFollowedConnections(followedUsersIds: string[], followedUsersPostsIds: string[]): Promise<{ _id: string, count: number }[]>

    findCommentedPostsCountsByFollowedConnections(followedUsersIds: string[], followedUsersPostsIds: string[]): Promise<{ _id: string, count: number }[]>

    findPostsByFollowedConnections(postIds: string[], userIds: string[]): Promise<{ userId: string, postId: string }[]>

    findPostsByIds(postIds: string[]): Promise<IPost[]>

    updatePostsByCreator(creator: Pick<IUser, '_id' | 'firstName' | 'lastName' | 'username' | 'photoUrl'>): Promise<void>

    updateCommentsByCreator(creator: Pick<IUser, '_id' | 'username' | 'photoUrl'>): Promise<void>
}