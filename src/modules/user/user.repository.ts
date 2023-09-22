import { injectable } from 'inversify'
import { IUserRepository } from './interfaces/IUser.repository'
import UserModel, { IUser } from './db.models/user.model'
import FollowModel, { IFollow } from './db.models/follow.model'
import { FindUsersBySearchQueryDto, SignUpDto, FindFollowingForUserDto, FindFollowersForUserDto } from './dtos'
import { SearchUser, FollowingForUser, FollowersForUser, SuggestedUser } from './graphql.models'
import { Types } from 'mongoose'
import { getCursorPaginatedData } from '../../shared/utils/misc'


@injectable()
export class UserRepository implements IUserRepository {

    public async createUser(signUpDto: SignUpDto): Promise<Omit<IUser, 'password' | 'refreshToken'>> {
        const user = new UserModel({
            firstName: signUpDto.firstName,
            lastName: signUpDto.lastName,
            username: signUpDto.username,
            password: signUpDto.password,
        })
        return await user.save() as unknown as Omit<IUser, 'password' | 'refreshToken'>
    }

    public async findUserById(id: string): Promise<IUser | null> {
        const user = await UserModel.findById(id)
        return user ? user.toObject() : null
    }

    public async findUsersByIds(ids: string[]): Promise<IUser[]> {
        try {
            const userIds = ids.map(id => new Types.ObjectId(id))
            const users: IUser[] = await UserModel.find({ _id: { $in: userIds } }).lean()
            const usersMap: { [key: string]: IUser } = users.reduce((usersMap, user) => ({
                ...usersMap,
                [user._id.toString()]: user,
            }), {})
            return ids.filter(id => usersMap[id]).map(id => usersMap[id])
        } catch (err) {
            throw err
        }
    }

    public async findUserByUsername(username: string): Promise<IUser | null> {
        const user = await UserModel.findOne({ username })
        return user ? user.toObject() : null
    }

    public async findUsersBySearchQuery(findUsersBySearchQueryDto: FindUsersBySearchQueryDto): Promise<IUser[]> {
        const regex = new RegExp(findUsersBySearchQueryDto.searchQuery, 'i')
        return UserModel
            .find({
                $or: [
                    { firstName: { $regex: regex } },
                    { lastName: { $regex: regex } },
                    { username: { $regex: regex } },
                ],
            })
            .sort('username')
            .limit(findUsersBySearchQueryDto.limit)
            .lean()
    }

    public async findSearchUsersBySearchQuery(userId: string, searchQuery: string, limit: number): Promise<SearchUser[]> {
        const regex = new RegExp(searchQuery, 'i')

        interface AggregateResult extends IUser {
            followers: IUser[]
            followedCount: number
        }

        const followedUserIds = await this.findFollowedUserIds(userId)

        const aggregateResult = await UserModel.aggregate(
            [
                {
                    $match: {
                        $or: [
                            { firstName: { $regex: regex } },
                            { lastName: { $regex: regex } },
                            { username: { $regex: regex } },
                        ],
                    },
                },
                {
                    $sort: { username: 1 },
                },
                {
                    $limit: limit,
                },
                {
                    $addFields: {
                        userId: { $toString: '$_id' },
                    },
                },
                {
                    $lookup: {
                        from: FollowModel.collection.name,
                        localField: 'userId',
                        foreignField: 'followedUserId',
                        as: 'follows',
                    },
                },
                {
                    $project: {
                        _id: 1,
                        firstName: 1,
                        lastName: 1,
                        username: 1,
                        photoUrl: 1,
                        follows: {
                            $filter: {
                                input: '$follows',
                                as: 'follow',
                                cond: {
                                    $in: ['$$follow.followingUserId', followedUserIds],
                                },
                            },
                        },
                    },
                },
                {
                    $unwind: {
                        path: '$follows',
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $sort: {
                        'follows.createdAt': -1,
                    },
                },
                {
                    $group: {
                        _id: '$_id',
                        firstName: { $first: '$firstName' },
                        lastName: { $first: '$lastName' },
                        username: { $first: '$username' },
                        photoUrl: { $first: '$photoUrl' },
                        latestFollowerId: { $first: '$follows.followingUserId' },
                        followedCount: { $count: {} },
                    },
                },
                {
                    $addFields: {
                        latestFollowerObjectId: {
                            $cond: {
                                if: { $ne: ['$latestFollowerId', null] },
                                then: { $toObjectId: '$latestFollowerId' },
                                else: null,
                            },
                        },
                    },
                },
                {
                    $lookup: {
                        from: UserModel.collection.name,
                        localField: 'latestFollowerObjectId',
                        foreignField: '_id',
                        as: 'followers',
                    },
                },
            ],
        ) as unknown as AggregateResult[]
        return aggregateResult.map(aggregateResult => ({
            user: {
                _id: aggregateResult._id,
                firstName: aggregateResult.firstName,
                lastName: aggregateResult.lastName,
                username: aggregateResult.username,
                photoUrl: aggregateResult.photoUrl,
            },
            latestFollower: aggregateResult.followers.length > 0 ? aggregateResult.followers[0] : null,
            followersCount: aggregateResult.followers.length > 0 ? aggregateResult.followedCount : 0,
        }))
    }

    public async findSearchUsersByIds(userId: string, ids: string[], limit: number): Promise<SearchUser[]> {
        interface AggregateResult extends IUser {
            followers: IUser[]
            followedCount: number
        }

        const followedUserIds = await this.findFollowedUserIds(userId)

        const aggregateResult = await UserModel.aggregate(
            [
                {
                    $addFields: {
                        userId: { $toString: '$_id' },
                    },
                },
                {
                    $match: {
                        userId: { $in: ids },
                    },
                },
                {
                    $lookup: {
                        from: FollowModel.collection.name,
                        localField: 'userId',
                        foreignField: 'followedUserId',
                        as: 'follows',
                    },
                },
                {
                    $project: {
                        _id: 1,
                        firstName: 1,
                        lastName: 1,
                        username: 1,
                        photoUrl: 1,
                        follows: {
                            $filter: {
                                input: '$follows',
                                as: 'follow',
                                cond: {
                                    $in: ['$$follow.followingUserId', followedUserIds],
                                },
                            },
                        },
                    },
                },
                {
                    $unwind: {
                        path: '$follows',
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $sort: {
                        'follows.createdAt': -1,
                    },
                },
                {
                    $group: {
                        _id: '$_id',
                        firstName: { $first: '$firstName' },
                        lastName: { $first: '$lastName' },
                        username: { $first: '$username' },
                        photoUrl: { $first: '$photoUrl' },
                        latestFollowerId: { $first: '$follows.followingUserId' },
                        followedCount: { $count: {} },
                    },
                },
                {
                    $addFields: {
                        latestFollowerObjectId: {
                            $cond: {
                                if: { $ne: ['$latestFollowerId', null] },
                                then: { $toObjectId: '$latestFollowerId' },
                                else: null,
                            },
                        },
                    },
                },
                {
                    $lookup: {
                        from: UserModel.collection.name,
                        localField: 'latestFollowerObjectId',
                        foreignField: '_id',
                        as: 'followers',
                    },
                },
                {
                    $sort: { username: 1 },
                },
                {
                    $limit: limit,
                },
            ],
        ) as unknown as AggregateResult[]
        return aggregateResult.map(aggregateResult => ({
            user: {
                _id: aggregateResult._id,
                firstName: aggregateResult.firstName,
                lastName: aggregateResult.lastName,
                username: aggregateResult.username,
                photoUrl: aggregateResult.photoUrl,
            },
            latestFollower: aggregateResult.followers.length > 0 ? aggregateResult.followers[0] : null,
            followersCount: aggregateResult.followers.length > 0 ? aggregateResult.followedCount : 0,
        }))
    }

    public async findFollowedUserIds(userId: string): Promise<string[]> {
        const follows: IFollow[] = await FollowModel
            .find({ followingUserId: userId })
            .select('followedUserId')
            .lean()
        return follows.map(follow => follow.followedUserId)
    }

    public async updateUserById(id: string, user: Partial<IUser>): Promise<IUser | null> {
        const updateUser = await UserModel.findOneAndUpdate({ _id: id }, user, { new: true })
        return updateUser ? updateUser.toObject() : null
    }

    public async findFollowByUserIds(followingUserId: string, followedUserId: string): Promise<IFollow | null> {
        const follows: IFollow[] = await FollowModel.find({ followingUserId, followedUserId }).lean()
        return follows.length > 0 ? follows[0] : null
    }

    public async followUser(followingUserId: string, followedUserId: string): Promise<IFollow> {
        const follow = new FollowModel({
            followingUserId,
            followedUserId,
        })
        await follow.save()
        return follow.toObject() as unknown as IFollow
    }

    public async unfollowUser(followingUserId: string, followedUserId: string): Promise<IFollow | null> {
        return FollowModel.findOneAndDelete({ followingUserId, followedUserId })
    }

    public async findFollowingForUser({
                                          userId,
                                          cursor,
                                          limit,
                                      }: FindFollowingForUserDto, loggedInUserId: string): Promise<FollowingForUser> {
        try {
            const followedUsersIds = await this.findFollowedUserIds(loggedInUserId)

            const followingForUser = await FollowModel.aggregate([
                {
                    $match: { followingUserId: userId },
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
                                                { _id: { $lt: new Types.ObjectId(cursor._id) } },
                                                { _id: new Types.ObjectId(cursor._id) },
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
                                    following: { $in: ['$followedUserId', followedUsersIds] },
                                    followedUserObjectId: { $toObjectId: '$followedUserId' },
                                },
                            },
                            {
                                $lookup: {
                                    from: UserModel.collection.name,
                                    localField: 'followedUserObjectId',
                                    foreignField: '_id',
                                    as: 'followedUsers',
                                },
                            },
                            {
                                $project: {
                                    user: { $ifNull: [{ $arrayElemAt: ['$followedUsers', 0] }, null] },
                                    following: 1,
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

            return getCursorPaginatedData(followingForUser) as unknown as FollowingForUser
        } catch (err) {
            throw err
        }
    }

    public async findFollowersForUser({
                                          userId,
                                          cursor,
                                          limit,
                                      }: FindFollowersForUserDto, loggedInUserId: string): Promise<FollowersForUser> {
        try {
            const followedUsersIds = await this.findFollowedUserIds(loggedInUserId)

            const followersForUser = await FollowModel.aggregate([
                {
                    $match: { followedUserId: userId },
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
                                                { _id: { $lt: new Types.ObjectId(cursor._id) } },
                                                { _id: new Types.ObjectId(cursor._id) },
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
                                    following: { $in: ['$followingUserId', followedUsersIds] },
                                    followingUserObjectId: { $toObjectId: '$followingUserId' },
                                },
                            },
                            {
                                $lookup: {
                                    from: UserModel.collection.name,
                                    localField: 'followingUserObjectId',
                                    foreignField: '_id',
                                    as: 'followingUsers',
                                },
                            },
                            {
                                $project: {
                                    user: { $ifNull: [{ $arrayElemAt: ['$followingUsers', 0] }, null] },
                                    following: 1,
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

            return getCursorPaginatedData(followersForUser) as unknown as FollowersForUser
        } catch (err) {
            throw err
        }
    }

    public async findFollowingCount(userId: string): Promise<number> {
        return FollowModel.countDocuments({ followingUserId: userId })
    }

    public async findFollowersCount(userId: string): Promise<number> {
        return FollowModel.countDocuments({ followedUserId: userId })
    }

    public async findMutualFollowersIds(userId: string, followedUsersIds: string[]): Promise<string[]> {
        try {
            const follows: IFollow[] = await FollowModel
                .find({
                    $and: [
                        { followedUserId: userId },
                        { followingUserId: { $in: followedUsersIds } },
                    ],
                })
                .sort({ createdAt: -1 })
                .lean()
            return follows.map(follow => follow.followingUserId)
        } catch (err) {
            throw err
        }
    }

    public async findFollowersOfFollowedCountByUser(userId: string, followedUsersIds: string[]): Promise<{ _id: string, count: number }[]> {
        return FollowModel.aggregate([
            {
                $match: {
                    followingUserId: { $in: followedUsersIds },
                    followedUserId: {
                        $ne: userId,
                        $nin: followedUsersIds,
                    },
                },
            },
            {
                $group: {
                    _id: '$followedUserId',
                    count: { $count: {} },
                },
            },
        ])
    }

    public async findSuggestedUsers(suggestedUsersIds: string[], followedUsersIds: string[]): Promise<SuggestedUser[]> {
        return UserModel.aggregate([
            {
                $addFields: {
                    _userId: { $toString: '$_id' },
                },
            },
            {
                $match: {
                    _userId: { $in: suggestedUsersIds },
                },
            },
            {
                $lookup: {
                    from: FollowModel.collection.name,
                    localField: '_userId',
                    foreignField: 'followedUserId',
                    as: 'follows',
                },
            },
            {
                $project: {
                    _id: 1,
                    firstName: 1,
                    lastName: 1,
                    username: 1,
                    photoUrl: 1,
                    follows: {
                        $filter: {
                            input: '$follows',
                            as: 'follow',
                            cond: {
                                $in: ['$$follow.followingUserId', followedUsersIds],
                            },
                        },
                    },
                },
            },
            {
                $unwind: {
                    path: '$follows',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $sort: {
                    'follows.createdAt': -1,
                },
            },
            {
                $addFields: {
                    isFollowed: {
                        $in: ['$follows.followingUserId', followedUsersIds],
                    },
                },
            },
            {
                $group: {
                    _id: '$_id',
                    firstName: { $first: '$firstName' },
                    lastName: { $first: '$lastName' },
                    photoUrl: { $first: '$photoUrl' },
                    username: { $first: '$username' },
                    latestFollowerId: { $first: '$follows.followingUserId' },
                    followedCount: {
                        $sum: {
                            $cond: {
                                if: { $eq: ['$isFollowed', true] },
                                then: 1,
                                else: 0,
                            },
                        },
                    },
                },
            },
            {
                $addFields: {
                    following: false,
                    latestFollowerObjectId: {
                        $cond: {
                            if: { $ne: ['$latestFollowerId', null] },
                            then: { $toObjectId: '$latestFollowerId' },
                            else: null,
                        },
                    },
                },
            },
            {
                $lookup: {
                    from: UserModel.collection.name,
                    localField: 'latestFollowerObjectId',
                    foreignField: '_id',
                    as: 'followers',
                },
            },
            {
                $project: {
                    followableUser: {
                        user: {
                            _id: '$_id',
                            firstName: '$firstName',
                            lastName: '$lastName',
                            username: '$username',
                            photoUrl: '$photoUrl',
                        },
                        following: '$following',
                    },
                    latestFollower: { $ifNull: [{ $arrayElemAt: ['$followers', 0] }, null] },
                    followersCount: '$followedCount',
                },
            },
        ])
    }

    public async findPopularUsersCountsByFollowedConnections(userId: string, followedUsersIds: string[]): Promise<{ _id: string, count: number }[]> {
        return FollowModel.aggregate([
            {
                $match: {
                    followedUserId: { $nin: [userId, ...followedUsersIds] },
                },
            },
            {
                $group: {
                    _id: '$followedUserId',
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

    public async findPopularUsersExcludedIdsByFollowedConnections(userId: string, followedUsersIds: string[], popularUsersIds: string[]): Promise<string[]> {
        try {
            const otherPopularUsers: Pick<IUser, '_id'>[] = await UserModel
                .find({
                    _id: {
                        $nin: [
                            userId,
                            ...followedUsersIds.map(id => new Types.ObjectId(id)),
                            ...popularUsersIds.map(id => new Types.ObjectId(id)),
                        ],
                    },
                })
                .limit(50)
                .select('_id')
                .lean()
            return otherPopularUsers.map(user => user._id.toString())
        } catch (err) {
            throw err
        }
    }
}