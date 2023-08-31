import { inject, injectable } from 'inversify'
import { TYPES } from '../../container/types'
import { IPostRepository } from './interfaces/IPost.repository'
import { IUserRepository } from '../user/interfaces/IUser.repository'
import PostModel, { IPost } from './db.models/post.model'
import HashtagModel, { IHashtag } from './db.models/hashtag.model'
import HashtagPostModel, { IHashtagPost } from './db.models/hashtag-post.model'
import UserModel, { IUser } from '../user/db.models/user.model'
import PostLikeModel, { IPostLike } from './db.models/post-like.model'
import PostSaveModel, { IPostSave } from './db.models/post-save.model'
import CommentModel, { IComment } from './db.models/comment.model'
import CommentLikeModel, { ICommentLike } from './db.models/comment-like.model'
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
} from './graphql.models'
import { getCursorPaginatedData, getOffsetPaginatedData } from '../../shared/utils/misc'
import mongoose, { Types } from 'mongoose'


@injectable()
export class PostRepository implements IPostRepository {

    constructor(@inject(TYPES.IUserRepository) private readonly _userRepository: IUserRepository) {
    }

    public async createPost(
        createPostDto: Pick<CreatePostDto, 'caption' | 'location'>,
        photoUrls: string[],
        creator: Pick<IUser, '_id' | 'firstName' | 'lastName' | 'username' | 'photoUrl'>): Promise<IPost> {
        const { caption = null, location = null } = createPostDto
        const post = new PostModel({
            caption,
            location,
            photoUrls,
            creator,
        })
        await post.save()
        return post.toObject()
    }

    public async createComment({
                                   text,
                                   postId,
                                   replyCommentId,
                               }: CreateCommentDto, creator: Pick<IUser, '_id' | 'username' | 'photoUrl'>): Promise<IComment> {
        const comment = new CommentModel({
            text,
            creator,
            postId,
            ...replyCommentId && { commentId: replyCommentId },
        })
        await comment.save()
        return comment.toObject()
    }

    public async createHashtag(name: string): Promise<IHashtag> {
        const hashtag = new HashtagModel({ name })
        await hashtag.save()
        return hashtag.toObject()
    }

    public async createHashtagPost(hashtagId: string, postId: string): Promise<IHashtagPost> {
        const hashtagPost = new HashtagPostModel({
            hashtagId,
            postId,
        })
        await hashtagPost.save()
        return hashtagPost.toObject()
    }

    public async findHashtagsBySearchQuery(searchQuery: string, limit: number): Promise<Hashtag[]> {
        const regex = new RegExp(searchQuery, 'i')
        return HashtagModel.aggregate([
            {
                $match: { name: { $regex: regex } },
            },
            {
                $sort: { name: 1 },
            },
            {
                $limit: limit,
            },
            {
                $addFields: {
                    hashtagId: { $toString: '$_id' },
                },
            },
            {
                $lookup: {
                    from: HashtagPostModel.collection.name,
                    localField: 'hashtagId',
                    foreignField: 'hashtagId',
                    as: 'posts',
                },
            },
            {
                $addFields: {
                    postsCount: { $size: '$posts' },
                },
            },
        ])
    }

    public async findHashtagById(id: string): Promise<IHashtag | null> {
        const hashtag = await HashtagModel.findById(id)
        return hashtag ? hashtag.toObject() : null
    }

    public async findHashtagsByIds(ids: string[], limit: number): Promise<Hashtag[]> {
        try {
            const hashtagIds = ids.map(id => new Types.ObjectId(id))
            return HashtagModel.aggregate([
                {
                    $match: { _id: { $in: hashtagIds } },
                },
                {
                    $limit: limit,
                },
                {
                    $addFields: {
                        hashtagId: { $toString: '$_id' },
                    },
                },
                {
                    $lookup: {
                        from: HashtagPostModel.collection.name,
                        localField: 'hashtagId',
                        foreignField: 'hashtagId',
                        as: 'posts',
                    },
                },
                {
                    $addFields: {
                        postsCount: { $size: '$posts' },
                    },
                },
            ])
        } catch (err) {
            throw err
        }
    }

    public async findHashtagsByNames(names: string[]): Promise<IHashtag[]> {
        return HashtagModel
            .find({ name: { $in: names } })
            .lean()
    }

    public async findPostById(postId: string): Promise<IPost | null> {
        const post = await PostModel.findById(postId)
        return post ? post.toObject() : null
    }

    public async findFollowedUsersPosts({
                                            cursor,
                                            limit,
                                        }: FindFollowedUsersPostsDto, userId: string): Promise<FollowedUsersPosts> {
        try {
            const followedUsersIds = await this._userRepository.findFollowedUserIds(userId)

            const posts = await PostModel.aggregate([
                {
                    $addFields: {
                        postId: { $toString: '$_id' },
                        creatorId: { $toString: '$creator._id' },
                    },
                },
                {
                    $match: {
                        $or: [
                            { creatorId: { $in: followedUsersIds } },
                            { creatorId: userId },
                        ],
                    },
                },
                {
                    $sort: { createdAt: -1, _id: -1 },
                },
                ...(cursor ? [
                    {
                        $match: {
                            $or: [
                                { createdAt: { $lt: cursor.createdAt } },
                                {
                                    $and: [
                                        { createdAt: cursor.createdAt },
                                        {
                                            $or: [
                                                { _id: { $lt: new mongoose.Types.ObjectId(cursor._id) } },
                                                { _id: new mongoose.Types.ObjectId(cursor._id) },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                ] : []),
                {
                    $facet: {
                        data: [
                            { $limit: limit },
                            {
                                $lookup: {
                                    from: CommentModel.collection.name,
                                    let: { postId: '$postId' },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $and: [
                                                        { $eq: ['$postId', '$$postId'] },
                                                        { $eq: ['$commentId', null] },
                                                    ],
                                                },
                                            },
                                        },
                                    ],
                                    as: 'comments',
                                },
                            },
                            {
                                $project: {
                                    _id: 1,
                                    postId: 1,
                                    creatorId: 1,
                                    caption: 1,
                                    location: 1,
                                    photoUrls: 1,
                                    creator: 1,
                                    commentsCount: { $size: '$comments' },
                                    createdAt: 1,
                                },
                            },
                            {
                                $lookup: {
                                    from: PostLikeModel.collection.name,
                                    localField: 'postId',
                                    foreignField: 'postId',
                                    as: 'postLikes',
                                },
                            },
                            {
                                $addFields: {
                                    liked: {
                                        $in: [userId, '$postLikes.userId'],
                                    },
                                },
                            },
                            {
                                $lookup: {
                                    from: PostSaveModel.collection.name,
                                    localField: 'postId',
                                    foreignField: 'postId',
                                    as: 'postSaves',
                                },
                            },
                            {
                                $addFields: {
                                    saved: {
                                        $in: [userId, '$postSaves.userId'],
                                    },
                                },
                            },
                            {
                                $unwind: {
                                    path: '$postLikes',
                                    preserveNullAndEmptyArrays: true,
                                },
                            },
                            {
                                $sort: { 'postLikes.createdAt': -1 },
                            },
                            {
                                $group: {
                                    _id: '$_id',
                                    post: {
                                        $first: {
                                            _id: '$_id',
                                            caption: '$caption',
                                            location: '$location',
                                            photoUrls: '$photoUrls',
                                            creator: {
                                                user: '$creator',
                                                following: true,
                                            },
                                            createdAt: '$createdAt',
                                        },
                                    },
                                    liked: { $first: '$liked' },
                                    saved: { $first: '$saved' },
                                    commentsCount: { $first: '$commentsCount' },
                                    likesCount: {
                                        $sum: {
                                            $cond: [{ $ifNull: ['$postLikes', false] }, 1, 0],
                                        },
                                    },
                                    latestTwoLikeUserIds: { $push: '$postLikes.userId' },
                                    latestThreeFollowedLikeUserIds: {
                                        $push: {
                                            $cond: {
                                                if: { $in: ['$postLikes.userId', followedUsersIds] },
                                                then: '$postLikes.userId',
                                                else: '$$REMOVE',
                                            },
                                        },
                                    },
                                },
                            },
                            {
                                $sort: { 'post.createdAt': -1, 'post._id': -1 },
                            },
                            {
                                $addFields: {
                                    latestTwoLikeUserIds: {
                                        $slice: ['$latestTwoLikeUserIds', 2],
                                    },
                                    latestThreeFollowedLikeUserIds: {
                                        $slice: ['$latestThreeFollowedLikeUserIds', 3],
                                    },
                                },
                            },
                            {
                                $addFields: {
                                    latestTwoLikeUserObjectIds: {
                                        $map: {
                                            input: '$latestTwoLikeUserIds',
                                            as: 'userId',
                                            in: { $toObjectId: '$$userId' },
                                        },
                                    },
                                    latestThreeFollowedLikeUserObjectIds: {
                                        $map: {
                                            input: '$latestThreeFollowedLikeUserIds',
                                            as: 'userId',
                                            in: { $toObjectId: '$$userId' },
                                        },
                                    },
                                },
                            },
                            {
                                $lookup: {
                                    from: UserModel.collection.name,
                                    let: { latestTwoLikeUserObjectIds: '$latestTwoLikeUserObjectIds' },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: { $in: ['$_id', '$$latestTwoLikeUserObjectIds'] },
                                            },
                                        },
                                        {
                                            $addFields: {
                                                __order: { $indexOfArray: ['$$latestTwoLikeUserObjectIds', '$_id'] },
                                            },
                                        },
                                        {
                                            $sort: { __order: 1 },
                                        },
                                        {
                                            $project: {
                                                __order: 0,
                                            },
                                        },
                                    ],
                                    as: 'latestTwoLikeUsers',
                                },
                            },
                            {
                                $lookup: {
                                    from: UserModel.collection.name,
                                    let: { latestThreeFollowedLikeUserObjectIds: '$latestThreeFollowedLikeUserObjectIds' },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: { $in: ['$_id', '$$latestThreeFollowedLikeUserObjectIds'] },
                                            },
                                        },
                                        {
                                            $addFields: {
                                                __order: { $indexOfArray: ['$$latestThreeFollowedLikeUserObjectIds', '$_id'] },
                                            },
                                        },
                                        {
                                            $sort: { __order: 1 },
                                        },
                                        {
                                            $project: {
                                                __order: 0,
                                            },
                                        },
                                    ],
                                    as: 'latestThreeFollowedLikeUsers',
                                },
                            },
                            {
                                $addFields: {
                                    latestLikeUser: {
                                        $arrayElemAt: ['$latestLikeUser', 0],
                                    },
                                    latestThreeFollowedLikeUsers: {
                                        $filter: {
                                            input: '$latestThreeFollowedLikeUsers',
                                            as: 'user',
                                            cond: { $ne: ['$$user.photoUrl', null] },
                                        },
                                    },
                                },
                            },
                        ],
                        nextCursor: [
                            { $skip: limit },
                            {
                                $limit: 1,
                            },
                            {
                                $project: {
                                    _id: '$_id',
                                    createdAt: '$createdAt',
                                },
                            },
                        ],
                    },
                },
            ])
            return getCursorPaginatedData(posts) as unknown as FollowedUsersPosts
        } catch (err) {
            throw err
        }
    }

    public async findPostLike(postId: string, userId: string): Promise<IPostLike | null> {
        const postLikes: IPostLike[] = await PostLikeModel.find({ postId, userId }).lean()
        return postLikes.length > 0 ? postLikes[0] : null
    }

    public async createPostLike(postId: string, userId: string): Promise<IPostLike> {
        const postLike = new PostLikeModel({
            postId,
            userId,
        })
        await postLike.save()
        return postLike.toObject()
    }

    public async deletePostLike(postId: string, userId: string): Promise<IPostLike | null> {
        return PostLikeModel.findOneAndDelete({ postId, userId }).lean()
    }

    public async findPostSave(postId: string, userId: string): Promise<IPostSave | null> {
        const postSaves: IPostSave[] = await PostSaveModel.find({ postId, userId }).lean()
        return postSaves.length > 0 ? postSaves[0] : null
    }

    public async createPostSave(postId: string, userId: string): Promise<IPostSave> {
        const postSave = new PostSaveModel({
            postId,
            userId,
        })
        await postSave.save()
        return postSave.toObject()
    }

    public async deletePostSave(postId: string, userId: string): Promise<IPostSave | null> {
        return PostSaveModel.findOneAndDelete({ postId, userId }).lean()
    }

    public async findCommentById(commentId: string): Promise<IComment | null> {
        const comment = await CommentModel.findById(commentId)
        return comment ? comment.toObject() : null
    }

    public async findCommentLike(commentId: string, userId: string): Promise<ICommentLike | null> {
        const commentLikes: ICommentLike[] = await CommentLikeModel.find({ commentId, userId }).lean()
        return commentLikes.length > 0 ? commentLikes[0] : null
    }

    public async createCommentLike(commentId: string, userId: string): Promise<ICommentLike> {
        const commentLike = new CommentLikeModel({
            commentId,
            userId,
        })
        await commentLike.save()
        return commentLike.toObject()
    }

    public async deleteCommentLike(commentId: string, userId: string): Promise<ICommentLike | null> {
        return CommentLikeModel.findOneAndDelete({ commentId, userId }).lean()
    }

    public async findUsersWhoLikedPost({
                                           postId,
                                           cursor,
                                           limit,
                                       }: FindUsersWhoLikedPostDto, userId: string): Promise<UsersWhoLikedPost> {
        try {
            const followedUsersIds = await this._userRepository.findFollowedUserIds(userId)

            const usersWhoLikedPost = await PostLikeModel.aggregate([
                {
                    $match: { postId },
                },
                {
                    $sort: { createdAt: -1, _id: -1 },
                },
                ...(cursor ? [
                    {
                        $match: {
                            $or: [
                                { createdAt: { $lt: cursor.createdAt } },
                                {
                                    $and: [
                                        { createdAt: cursor.createdAt },
                                        {
                                            $or: [
                                                { _id: { $lt: new mongoose.Types.ObjectId(cursor._id) } },
                                                { _id: new mongoose.Types.ObjectId(cursor._id) },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                ] : []),
                {
                    $facet: {
                        data: [
                            { $limit: limit },
                            {
                                $addFields: {
                                    userObjectId: { $toObjectId: '$userId' },
                                },
                            },
                            {
                                $lookup: {
                                    from: UserModel.collection.name,
                                    localField: 'userObjectId',
                                    foreignField: '_id',
                                    as: 'user',
                                },
                            },
                            {
                                $addFields: {
                                    user: {
                                        $arrayElemAt: ['$user', 0],
                                    },
                                },
                            },
                            {
                                $project: {
                                    user: 1,
                                    following: {
                                        $in: ['$userId', followedUsersIds],
                                    },
                                },
                            },
                        ],
                        nextCursor: [
                            { $skip: limit },
                            {
                                $limit: 1,
                            },
                            {
                                $project: {
                                    _id: '$_id',
                                    createdAt: '$createdAt',
                                },
                            },
                        ],
                    },
                },
            ])

            return getCursorPaginatedData(usersWhoLikedPost) as unknown as UsersWhoLikedPost
        } catch (err) {
            throw err
        }
    }

    public async findCommentsForPost({
                                         postId,
                                         offset,
                                         limit,
                                     }: FindCommentsForPostDto, userId: string): Promise<CommentsForPost> {

        const aggregateComments = await CommentModel.aggregate([
            {
                $match: {
                    postId,
                    commentId: null,
                },
            },
            {
                $sort: { createdAt: 1 },
            },
            {
                $facet: {
                    metadata: [{
                        $count: 'count',
                    }],
                    data: [
                        {
                            $skip: offset,
                        },
                        {
                            $limit: limit,
                        },
                        {
                            $addFields: {
                                commentId: { $toString: '$_id' },
                            },
                        },
                        {
                            $lookup: {
                                from: CommentLikeModel.collection.name,
                                localField: 'commentId',
                                foreignField: 'commentId',
                                as: 'commentLikes',
                            },
                        },
                        {
                            $lookup: {
                                from: CommentModel.collection.name,
                                localField: 'commentId',
                                foreignField: 'commentId',
                                as: 'commentReplies',
                            },
                        },
                        {
                            $addFields: {
                                liked: {
                                    $in: [userId, '$commentLikes.userId'],
                                },
                                likesCount: { $size: '$commentLikes' },
                                repliesCount: { $size: '$commentReplies' },
                            },
                        },
                    ],
                },
            },
        ])
        return getOffsetPaginatedData(aggregateComments)
    }

    public async findUsersWhoLikedComment({
                                              commentId,
                                              cursor,
                                              limit,
                                          }: FindUsersWhoLikedCommentDto, userId: string): Promise<UsersWhoLikedComment> {
        try {
            const followedUsersIds = await this._userRepository.findFollowedUserIds(userId)

            const usersWhoLikedComment = await CommentLikeModel.aggregate([
                {
                    $match: { commentId },
                },
                {
                    $sort: { createdAt: -1, _id: -1 },
                },
                ...(cursor ? [
                    {
                        $match: {
                            $or: [
                                { createdAt: { $lt: cursor.createdAt } },
                                {
                                    $and: [
                                        { createdAt: cursor.createdAt },
                                        {
                                            $or: [
                                                { _id: { $lt: new mongoose.Types.ObjectId(cursor._id) } },
                                                { _id: new mongoose.Types.ObjectId(cursor._id) },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                ] : []),
                {
                    $facet: {
                        data: [
                            { $limit: limit },
                            {
                                $addFields: {
                                    userObjectId: { $toObjectId: '$userId' },
                                },
                            },
                            {
                                $lookup: {
                                    from: UserModel.collection.name,
                                    localField: 'userObjectId',
                                    foreignField: '_id',
                                    as: 'user',
                                },
                            },
                            {
                                $addFields: {
                                    user: {
                                        $arrayElemAt: ['$user', 0],
                                    },
                                },
                            },
                            {
                                $project: {
                                    user: 1,
                                    following: {
                                        $in: ['$userId', followedUsersIds],
                                    },
                                },
                            },
                        ],
                        nextCursor: [
                            { $skip: limit },
                            {
                                $limit: 1,
                            },
                            {
                                $project: {
                                    _id: '$_id',
                                    createdAt: '$createdAt',
                                },
                            },
                        ],
                    },
                },
            ])

            return getCursorPaginatedData(usersWhoLikedComment) as unknown as UsersWhoLikedComment
        } catch (err) {
            throw err
        }
    }

    public async findCommentReplies({
                                        commentId,
                                        offset,
                                        limit,
                                    }: FindCommentRepliesDto, userId: string): Promise<CommentReplies> {

        const aggregateComments = await CommentModel.aggregate([
            {
                $match: {
                    commentId,
                },
            },
            {
                $sort: { createdAt: 1 },
            },
            {
                $facet: {
                    metadata: [{
                        $count: 'count',
                    }],
                    data: [
                        {
                            $skip: offset,
                        },
                        {
                            $limit: limit,
                        },
                        {
                            $addFields: {
                                commentId: { $toString: '$_id' },
                            },
                        },
                        {
                            $lookup: {
                                from: CommentLikeModel.collection.name,
                                localField: 'commentId',
                                foreignField: 'commentId',
                                as: 'commentLikes',
                            },
                        },
                        {
                            $lookup: {
                                from: CommentModel.collection.name,
                                localField: 'commentId',
                                foreignField: 'commentId',
                                as: 'commentReplies',
                            },
                        },
                        {
                            $addFields: {
                                liked: {
                                    $in: [userId, '$commentLikes.userId'],
                                },
                                likesCount: { $size: '$commentLikes' },
                                repliesCount: { $size: '$commentReplies' },
                            },
                        },
                    ],
                },
            },
        ])
        return getOffsetPaginatedData(aggregateComments)
    }

    public async findPostDetailsById(postId: string, userId: string): Promise<PostDetails | null> {
        try {
            const followedUsersIds = await this._userRepository.findFollowedUserIds(userId)

            const posts: PostDetails[] = await PostModel.aggregate([
                {
                    $addFields: {
                        postId: { $toString: '$_id' },
                        creatorId: { $toString: '$creator._id' },
                    },
                },
                {
                    $match: { postId },
                },
                {
                    $lookup: {
                        from: CommentModel.collection.name,
                        let: { postId: '$postId' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$postId', '$$postId'] },
                                            { $eq: ['$commentId', null] },
                                        ],
                                    },
                                },
                            },
                        ],
                        as: 'comments',
                    },
                },
                {
                    $project: {
                        _id: 1,
                        postId: 1,
                        creatorId: 1,
                        caption: 1,
                        location: 1,
                        photoUrls: 1,
                        creator: 1,
                        commentsCount: { $size: '$comments' },
                        createdAt: 1,
                    },
                },
                {
                    $lookup: {
                        from: PostLikeModel.collection.name,
                        localField: 'postId',
                        foreignField: 'postId',
                        as: 'postLikes',
                    },
                },
                {
                    $addFields: {
                        liked: {
                            $in: [userId, '$postLikes.userId'],
                        },
                    },
                },
                {
                    $lookup: {
                        from: PostSaveModel.collection.name,
                        localField: 'postId',
                        foreignField: 'postId',
                        as: 'postSaves',
                    },
                },
                {
                    $addFields: {
                        saved: {
                            $in: [userId, '$postSaves.userId'],
                        },
                    },
                },
                {
                    $unwind: {
                        path: '$postLikes',
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $sort: { 'postLikes.createdAt': -1 },
                },
                {
                    $group: {
                        _id: '$_id',
                        post: {
                            $first: {
                                _id: '$_id',
                                caption: '$caption',
                                location: '$location',
                                photoUrls: '$photoUrls',
                                creator: {
                                    user: '$creator',
                                    following: true,
                                },
                                createdAt: '$createdAt',
                            },
                        },
                        liked: { $first: '$liked' },
                        saved: { $first: '$saved' },
                        commentsCount: { $first: '$commentsCount' },
                        likesCount: {
                            $sum: {
                                $cond: [{ $ifNull: ['$postLikes', false] }, 1, 0],
                            },
                        },
                        latestTwoLikeUserIds: { $push: '$postLikes.userId' },
                        latestThreeFollowedLikeUserIds: {
                            $push: {
                                $cond: {
                                    if: { $in: ['$postLikes.userId', followedUsersIds] },
                                    then: '$postLikes.userId',
                                    else: '$$REMOVE',
                                },
                            },
                        },
                    },
                },
                {
                    $addFields: {
                        latestTwoLikeUserIds: {
                            $slice: ['$latestTwoLikeUserIds', 2],
                        },
                        latestThreeFollowedLikeUserIds: {
                            $slice: ['$latestThreeFollowedLikeUserIds', 3],
                        },
                    },
                },
                {
                    $addFields: {
                        latestTwoLikeUserObjectIds: {
                            $map: {
                                input: '$latestTwoLikeUserIds',
                                as: 'userId',
                                in: { $toObjectId: '$$userId' },
                            },
                        },
                        latestThreeFollowedLikeUserObjectIds: {
                            $map: {
                                input: '$latestThreeFollowedLikeUserIds',
                                as: 'userId',
                                in: { $toObjectId: '$$userId' },
                            },
                        },
                    },
                },
                {
                    $lookup: {
                        from: UserModel.collection.name,
                        let: { latestTwoLikeUserObjectIds: '$latestTwoLikeUserObjectIds' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $in: ['$_id', '$$latestTwoLikeUserObjectIds'] },
                                },
                            },
                            {
                                $addFields: {
                                    __order: { $indexOfArray: ['$$latestTwoLikeUserObjectIds', '$_id'] },
                                },
                            },
                            {
                                $sort: { __order: 1 },
                            },
                            {
                                $project: {
                                    __order: 0,
                                },
                            },
                        ],
                        as: 'latestTwoLikeUsers',
                    },
                },
                {
                    $lookup: {
                        from: UserModel.collection.name,
                        let: { latestThreeFollowedLikeUserObjectIds: '$latestThreeFollowedLikeUserObjectIds' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $in: ['$_id', '$$latestThreeFollowedLikeUserObjectIds'] },
                                },
                            },
                            {
                                $addFields: {
                                    __order: { $indexOfArray: ['$$latestThreeFollowedLikeUserObjectIds', '$_id'] },
                                },
                            },
                            {
                                $sort: { __order: 1 },
                            },
                            {
                                $project: {
                                    __order: 0,
                                },
                            },
                        ],
                        as: 'latestThreeFollowedLikeUsers',
                    },
                },
                {
                    $addFields: {
                        latestLikeUser: {
                            $arrayElemAt: ['$latestLikeUser', 0],
                        },
                        latestThreeFollowedLikeUsers: {
                            $filter: {
                                input: '$latestThreeFollowedLikeUsers',
                                as: 'user',
                                cond: { $ne: ['$$user.photoUrl', null] },
                            },
                        },
                    },
                },
            ])

            if (posts.length > 0) {
                return posts[0]
            }

            return null
        } catch (err) {
            throw err
        }
    }

    public async findPostsForUser({ userId, offset, limit }: FindPostsForUserDto): Promise<PostsForUser> {
        try {
            const aggregatePosts = await PostModel.aggregate([
                {
                    $match: { 'creator._id': new mongoose.Types.ObjectId(userId) },
                },
                {
                    $sort: { createdAt: -1 },
                },
                {
                    $facet: {
                        metadata: [{
                            $count: 'count',
                        }],
                        data: [
                            {
                                $skip: offset,
                            },
                            {
                                $limit: limit,
                            },
                        ],
                    },
                },
            ])
            return getOffsetPaginatedData(aggregatePosts)
        } catch (err) {
            throw err
        }
    }

    public async findPostsCount(userId: string): Promise<number> {
        return PostModel.countDocuments({ 'creator._id': new mongoose.Types.ObjectId(userId) })
    }

    public async findSavedPostsForUser({
                                           cursor,
                                           limit,
                                       }: FindSavedPostsForUserDto, userId: string): Promise<SavedPostsForUser> {
        try {
            const aggregatePosts = await PostSaveModel.aggregate([
                {
                    $match: { userId },
                },
                {
                    $sort: { createdAt: -1, _id: -1 },
                },
                ...(cursor ? [
                    {
                        $match: {
                            $or: [
                                { createdAt: { $lt: cursor.createdAt } },
                                {
                                    $and: [
                                        { createdAt: cursor.createdAt },
                                        {
                                            $or: [
                                                { _id: { $lt: new mongoose.Types.ObjectId(cursor._id) } },
                                                { _id: new mongoose.Types.ObjectId(cursor._id) },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                ] : []),
                {
                    $facet: {
                        data: [
                            { $limit: limit },
                            {
                                $addFields: {
                                    postObjectId: { $toObjectId: '$postId' },
                                },
                            },
                            {
                                $lookup: {
                                    from: PostModel.collection.name,
                                    localField: 'postObjectId',
                                    foreignField: '_id',
                                    as: 'posts',
                                },
                            },
                            {
                                $addFields: {
                                    post: { $arrayElemAt: ['$posts', 0] },
                                },
                            },
                            {
                                $project: {
                                    _id: '$post._id',
                                    photoUrls: '$post.photoUrls',
                                    caption: '$post.caption',
                                    location: '$post.location',
                                    creator: '$post.creator',
                                    createdAt: '$post.createdAt',
                                },
                            },
                        ],
                        nextCursor: [
                            { $skip: limit },
                            {
                                $limit: 1,
                            },
                            {
                                $project: {
                                    _id: '$_id',
                                    createdAt: '$createdAt',
                                },
                            },
                        ],
                    },
                },
            ])

            return getCursorPaginatedData(aggregatePosts) as unknown as SavedPostsForUser
        } catch (err) {
            throw err
        }
    }

    public async findPostsForHashtag(hashtagId: string, {
        offset,
        limit,
    }: Pick<FindPostsForHashtagDto, 'offset' | 'limit'>): Promise<PostsForHashtag> {
        try {
            const aggregatePosts = await HashtagPostModel.aggregate([
                {
                    $match: { hashtagId },
                },
                {
                    $sort: { createdAt: -1 },
                },
                {
                    $facet: {
                        metadata: [{
                            $count: 'count',
                        }],
                        data: [
                            {
                                $skip: offset,
                            },
                            {
                                $limit: limit,
                            },
                            {
                                $addFields: {
                                    postObjectId: { $toObjectId: '$postId' },
                                },
                            },
                            {
                                $lookup: {
                                    from: PostModel.collection.name,
                                    localField: 'postObjectId',
                                    foreignField: '_id',
                                    as: 'posts',
                                },
                            },
                            {
                                $addFields: {
                                    post: { $arrayElemAt: ['$posts', 0] },
                                },
                            },
                            {
                                $project: {
                                    _id: '$post._id',
                                    photoUrls: '$post.photoUrls',
                                    caption: '$post.caption',
                                    location: '$post.location',
                                    creator: '$post.creator',
                                    createdAt: '$post.createdAt',
                                },
                            },
                        ],
                    },
                },
            ])
            return getOffsetPaginatedData(aggregatePosts)
        } catch (err) {
            throw err
        }
    }

    public async findLikedPostIdsByFollowersAndUser(userId: string, followedUsersIds: string[]): Promise<string[]> {
        return PostLikeModel.find({
            $or: [
                { userId: { $in: followedUsersIds } },
                { userId },
            ],
        }).distinct('postId')
    }

    public async findLikedPostsCountsByFollowersAndUser(userId: string, followedUsersIds: string[], postLikesIds: string[]): Promise<{ _id: string, count: number }[]> {
        return PostLikeModel.aggregate([
            {
                $match: {
                    postId: { $in: postLikesIds },
                    userId: {
                        $ne: userId,
                        $nin: followedUsersIds,
                    },
                },
            },
            {
                $group: {
                    _id: '$userId',
                    count: { $count: {} },
                },
            },
        ])
    }

    public async findLikedCommentsCountsByFollowersAndUser(userId: string, followedUsersIds: string[], postLikesIds: string[]): Promise<{ _id: string, count: number }[]> {
        return CommentModel.aggregate([
            {
                $addFields: {
                    userId: { $toString: '$creator._id' },
                },
            },
            {
                $match: {
                    postId: { $in: postLikesIds },
                    userId: {
                        $ne: userId,
                        $nin: followedUsersIds,
                    },
                },
            },
            {
                $group: {
                    _id: {
                        userId: '$userId',
                        postId: '$postId',
                    },
                },
            },
            {
                $group: {
                    _id: '$_id.userId',
                    count: { $count: {} },
                },
            },
        ])
    }

    public async findFollowedUsersPostsIds(userId: string, followedUsersIds: string[]): Promise<string[]> {
        try {
            const followedUsersPosts: Pick<IPost, '_id'>[] = await PostModel
                .find({
                    'creator._id': {
                        $in: [
                            new Types.ObjectId(userId),
                            ...followedUsersIds.map(id => new Types.ObjectId(id))],
                    },
                })
                .select('_id')
                .lean()
            return followedUsersPosts.map(post => post._id.toString())
        } catch (err) {
            throw err
        }
    }

    public async findLikedPostsCountsByFollowedConnections(followedUsersIds: string[], followedUsersPostsIds: string[]): Promise<{ _id: string, count: number }[]> {
        return PostLikeModel.aggregate([
            {
                $match: {
                    userId: { $in: followedUsersIds },
                    postId: { $nin: followedUsersPostsIds },
                },
            },
            {
                $group: {
                    _id: '$postId',
                    count: { $count: {} },
                },
            },
            {
                $sort: { count: -1 },
            },
            {
                $limit: 50,
            },
        ])
    }
}