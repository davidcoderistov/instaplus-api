import { inject, injectable } from 'inversify'
import { IPostService } from './interfaces/IPost.service'
import { IPostRepository } from './interfaces/IPost.repository'
import { IUserRepository } from '../user/interfaces/IUser.repository'
import { INotificationRepository } from '../notification/interfaces/INotification.repository'
import { IFileRepository } from '../file/IFile.repository'
import { TYPES } from '../../container/types'
import { IHashtag } from './db.models/hashtag.model'
import { IPost } from './db.models/post.model'
import { IPostLike } from './db.models/post-like.model'
import { IComment } from './db.models/comment.model'
import { ICommentLike } from './db.models/comment-like.model'
import {
    CreatePostDto,
    FindFollowedUsersPostsDto,
    FindUsersWhoLikedPostDto,
    CreateCommentDto,
    FindCommentsForPostDto,
    FindUsersWhoLikedCommentDto,
    FindCommentRepliesDto,
    FindPostsForUserDto,
    FindSavedPostsForUserDto,
    FindPostsForHashtagDto,
} from './dtos'
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
    Post,
} from './graphql.models'
import { CustomValidationException } from '../../shared/exceptions'
import { FileUpload } from 'graphql-upload-ts'
import _difference from 'lodash/difference'
import _uniq from 'lodash/uniq'


@injectable()
export class PostService implements IPostService {

    constructor(
        @inject(TYPES.IPostRepository) private readonly _postRepository: IPostRepository,
        @inject(TYPES.IUserRepository) private readonly _userRepository: IUserRepository,
        @inject(TYPES.INotificationRepository) private readonly _notificationRepository: INotificationRepository,
        @inject(TYPES.IFileRepository) private readonly _fileRepository: IFileRepository) {
    }

    public async createPost(createPostDto: CreatePostDto, userId: string): Promise<IPost> {
        try {
            const creator = await this._userRepository.findUserById(userId)
            if (!creator) {
                return Promise.reject(new CustomValidationException('creatorId', `User ${userId} does not exist`))
            }

            const photoUrls: string[] = []
            const uploads = await createPostDto.photos
            const photos: Promise<FileUpload>[] = uploads.map(photo => new Promise(resolve => {
                resolve(photo)
            }))

            const results = await Promise.allSettled(photos.map(photo =>
                this._fileRepository.storeUpload(photo, '/instaplus/storage/posts', {
                    height: 1080,
                    width: 1080,
                })))

            results.forEach((result: PromiseFulfilledResult<{ photoUrl: string }> | PromiseRejectedResult) => {
                if (result.status === 'fulfilled') {
                    photoUrls.push(result.value.photoUrl)
                } else {
                    throw new CustomValidationException('photoUrl', `Could not upload photo`)
                }
            })

            const post = await this._postRepository.createPost(
                createPostDto,
                photoUrls,
                {
                    _id: creator._id,
                    firstName: creator.firstName,
                    lastName: creator.lastName,
                    username: creator.username,
                    photoUrl: creator.photoUrl,
                },
            )

            const { hashtags = [] } = createPostDto
            if (hashtags.length > 0) {
                const postId = post._id.toString()
                const savedHashtags = await this._postRepository.findHashtagsByNames(hashtags)
                const unsavedHashtagsNames: string[] = _difference(hashtags, savedHashtags.map(hashtag => hashtag.name))
                const unsavedHashtags: IHashtag[] = await Promise.all(
                    unsavedHashtagsNames.map(this._postRepository.createHashtag),
                )

                const hashtagIds = [
                    ...savedHashtags.map(hashtag => hashtag._id.toString()),
                    ...unsavedHashtags.map(hashtag => hashtag._id.toString()),
                ]
                await Promise.all(hashtagIds.map(hashtagId => this._postRepository.createHashtagPost(hashtagId, postId)))
            }

            return post
        } catch (err) {
            throw err
        }
    }

    public async createComment(createCommentDto: CreateCommentDto, userId: string): Promise<IComment> {
        try {
            const { postId, replyCommentId } = createCommentDto
            const creator = await this._userRepository.findUserById(userId)
            if (!creator) {
                return Promise.reject(new CustomValidationException('creatorId', `User ${userId} does not exist`))
            }

            if (!await this._postRepository.findPostById(postId)) {
                return Promise.reject(new CustomValidationException('postId', `Post with id ${postId} does not exist`))
            }

            if (replyCommentId) {
                if (!await this._postRepository.findCommentById(replyCommentId)) {
                    return Promise.reject(new CustomValidationException('commentId', `Comment with id ${replyCommentId} does not exist`))
                }
            }

            return this._postRepository.createComment(createCommentDto, {
                _id: creator._id,
                username: creator.username,
                photoUrl: creator.photoUrl,
            })
        } catch (err) {
            throw err
        }
    }

    public async findFollowedUsersPosts(findFollowedUsersPostsDto: FindFollowedUsersPostsDto, userId: string): Promise<FollowedUsersPosts> {
        return this._postRepository.findFollowedUsersPosts(findFollowedUsersPostsDto, userId)
    }

    public async findHashtagsBySearchQuery(searchQuery: string, limit: number): Promise<Hashtag[]> {
        return this._postRepository.findHashtagsBySearchQuery(searchQuery, limit)
    }

    public async likePost(postId: string, userId: string): Promise<IPostLike> {
        try {
            const post = await this._postRepository.findPostById(postId)
            if (!post) {
                return Promise.reject(new CustomValidationException('postId', `Post with id ${postId} does not exist`))
            }

            const user = await this._userRepository.findUserById(userId)
            if (!user) {
                return Promise.reject(new CustomValidationException('userId', `User with id ${userId} does not exist`))
            }

            if (await this._postRepository.findPostLike(postId, userId)) {
                return Promise.reject(new CustomValidationException('postId', `Post with id ${postId} is already liked`))
            }

            const postLike = await this._postRepository.createPostLike(postId, userId)
            this._notificationRepository.createPostLikeNotification({
                _id: post._id,
                photoUrls: post.photoUrls,
            }, {
                _id: user._id,
                username: user.username,
                photoUrl: user.photoUrl,
            }, post.creator._id.toString())
            return postLike
        } catch (err) {
            throw err
        }
    }

    public async unlikePost(postId: string, userId: string): Promise<IPostLike> {
        try {
            if (!await this._postRepository.findPostById(postId)) {
                return Promise.reject(new CustomValidationException('postId', `Post with id ${postId} does not exist`))
            }

            if (!await this._userRepository.findUserById(userId)) {
                return Promise.reject(new CustomValidationException('userId', `User with id ${userId} does not exist`))
            }

            const postLike = await this._postRepository.deletePostLike(postId, userId)

            if (!postLike) {
                return Promise.reject(new CustomValidationException('postId', `Post with id ${postId} is not liked`))
            }

            return postLike
        } catch (err) {
            throw err
        }
    }

    public async savePost(postId: string, userId: string): Promise<IPost> {
        try {
            const post = await this._postRepository.findPostById(postId)
            if (!post) {
                return Promise.reject(new CustomValidationException('postId', `Post with id ${postId} does not exist`))
            }

            if (!await this._userRepository.findUserById(userId)) {
                return Promise.reject(new CustomValidationException('userId', `User with id ${userId} does not exist`))
            }

            if (await this._postRepository.findPostSave(postId, userId)) {
                return Promise.reject(new CustomValidationException('postId', `Post with id ${postId} is already saved`))
            }

            await this._postRepository.createPostSave(postId, userId)
            return post
        } catch (err) {
            throw err
        }
    }

    public async unsavePost(postId: string, userId: string): Promise<IPost> {
        try {
            const post = await this._postRepository.findPostById(postId)
            if (!post) {
                return Promise.reject(new CustomValidationException('postId', `Post with id ${postId} does not exist`))
            }

            if (!await this._userRepository.findUserById(userId)) {
                return Promise.reject(new CustomValidationException('userId', `User with id ${userId} does not exist`))
            }

            const postSave = await this._postRepository.deletePostSave(postId, userId)

            if (!postSave) {
                return Promise.reject(new CustomValidationException('postId', `Post with id ${postId} is not saved`))
            }

            return post
        } catch (err) {
            throw err
        }
    }

    public async likeComment(commentId: string, userId: string): Promise<ICommentLike> {
        try {
            if (!await this._postRepository.findCommentById(commentId)) {
                return Promise.reject(new CustomValidationException('commentId', `Comment with id ${commentId} does not exist`))
            }

            if (!await this._userRepository.findUserById(userId)) {
                return Promise.reject(new CustomValidationException('userId', `User with id ${userId} does not exist`))
            }

            if (await this._postRepository.findCommentLike(commentId, userId)) {
                return Promise.reject(new CustomValidationException('commentId', `Comment with id ${commentId} is already liked`))
            }

            return this._postRepository.createCommentLike(commentId, userId)
        } catch (err) {
            throw err
        }
    }

    public async unlikeComment(commentId: string, userId: string): Promise<ICommentLike> {
        try {
            if (!await this._postRepository.findCommentById(commentId)) {
                return Promise.reject(new CustomValidationException('commentId', `Comment with id ${commentId} does not exist`))
            }

            if (!await this._userRepository.findUserById(userId)) {
                return Promise.reject(new CustomValidationException('userId', `User with id ${userId} does not exist`))
            }

            const commentLike = await this._postRepository.deleteCommentLike(commentId, userId)

            if (!commentLike) {
                return Promise.reject(new CustomValidationException('commentId', `Comment with id ${commentId} is not liked`))
            }

            return commentLike
        } catch (err) {
            throw err
        }
    }

    public async findUsersWhoLikedPost(findUsersWhoLikedPostDto: FindUsersWhoLikedPostDto, userId: string): Promise<UsersWhoLikedPost> {
        return this._postRepository.findUsersWhoLikedPost(findUsersWhoLikedPostDto, userId)
    }

    public async findCommentsForPost(findCommentsForPostDto: FindCommentsForPostDto, userId: string): Promise<CommentsForPost> {
        return this._postRepository.findCommentsForPost(findCommentsForPostDto, userId)
    }

    public async findUsersWhoLikedComment(findUsersWhoLikedCommentDto: FindUsersWhoLikedCommentDto, userId: string): Promise<UsersWhoLikedComment> {
        return this._postRepository.findUsersWhoLikedComment(findUsersWhoLikedCommentDto, userId)
    }

    public async findCommentReplies(findCommentRepliesDto: FindCommentRepliesDto, userId: string): Promise<CommentReplies> {
        return this._postRepository.findCommentReplies(findCommentRepliesDto, userId)
    }

    public async findPostDetailsById(postId: string, userId: string): Promise<PostDetails | null> {
        return this._postRepository.findPostDetailsById(postId, userId)
    }

    public async findPostsForUser(findPostsForUserDto: FindPostsForUserDto): Promise<PostsForUser> {
        return this._postRepository.findPostsForUser(findPostsForUserDto)
    }

    public async findSavedPostsForUser(findSavedPostsForUser: FindSavedPostsForUserDto, userId: string): Promise<SavedPostsForUser> {
        return this._postRepository.findSavedPostsForUser(findSavedPostsForUser, userId)
    }

    public async findPostsForHashtag(findPostsForHashtagDto: FindPostsForHashtagDto): Promise<PostsForHashtag> {
        try {
            const hashtags = await this._postRepository.findHashtagsByNames([findPostsForHashtagDto.name])

            if (hashtags.length > 0) {
                return this._postRepository.findPostsForHashtag(hashtags[0]._id.toString(), findPostsForHashtagDto)
            } else {
                return {
                    data: [],
                    count: 0,
                }
            }
        } catch (err) {
            throw err
        }
    }

    public async findSuggestedPosts(userId: string): Promise<Post[]> {
        try {
            if (!await this._userRepository.findUserById(userId)) {
                return Promise.reject(new CustomValidationException('userId', `User with id ${userId} does not exist`))
            }

            const followedUsersIds = await this._userRepository.findFollowedUserIds(userId)

            const followedUsersPostsIds = await this._postRepository.findFollowedUsersPostsIds(userId, followedUsersIds)

            const likedPostsCount = await this._postRepository.findLikedPostsCountsByFollowedConnections(followedUsersIds, followedUsersPostsIds)

            const savedPostsCount = await this._postRepository.findSavedPostsCountsByFollowedConnections(followedUsersIds, followedUsersPostsIds)

            const commentedPostsCount = await this._postRepository.findCommentedPostsCountsByFollowedConnections(followedUsersIds, followedUsersPostsIds)

            const followingSuggestedPostsWithCount: { [key: string]: number } = [
                ...likedPostsCount,
                ...savedPostsCount,
                ...commentedPostsCount,
            ].reduce((posts: { [key: string]: number }, post) => ({
                ...posts,
                [post._id]: (posts[post._id] ?? 0) + post.count,
            }), {})

            const followingSuggestedPostsIds = Object
                .keys(followingSuggestedPostsWithCount)
                .sort((a, b) => followingSuggestedPostsWithCount[b] - followingSuggestedPostsWithCount[a])

            const popularUsersCount = await this._userRepository.findPopularUsersCountsByFollowedConnections(userId, followedUsersIds)
            const popularUsersIds = popularUsersCount.map(user => user._id)

            const otherPopularUsersIds = await this._userRepository.findPopularUsersExcludedIdsByFollowedConnections(userId, followedUsersIds, popularUsersIds)

            const allPopularUsersIds = [
                ...popularUsersIds,
                ...otherPopularUsersIds,
            ]

            const popularPosts = await this._postRepository.findPostsByFollowedConnections(followingSuggestedPostsIds, allPopularUsersIds)

            const postsByUser: { [key: string]: string } = popularPosts.reduce((posts: { [key: string]: string }, post) => ({
                ...posts,
                [post.userId]: post.postId,
            }), {})

            const popularPostsIds = allPopularUsersIds
                .filter(userId => postsByUser.hasOwnProperty(userId))
                .map(userId => postsByUser[userId])

            const suggestedPostsIds = _uniq([
                ...followingSuggestedPostsIds,
                ...popularPostsIds,
            ])

            const suggestedPosts = await this._postRepository.findPostsByIds(suggestedPostsIds)

            const suggestedPostsById: { [postId: string]: IPost } = suggestedPosts.reduce((posts: { [postId: string]: IPost }, post) => ({
                ...posts,
                [post._id.toString()]: post,
            }), {})

            return suggestedPostsIds.map(suggestedPostId => suggestedPostsById[suggestedPostId]) as unknown as Post[]
        } catch (err) {
            throw err
        }
    }
}