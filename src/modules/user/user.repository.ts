import { injectable } from 'inversify'
import { IUserRepository } from './interfaces/IUser.repository'
import UserModel, { IUser } from './db.models/user.model'
import FollowModel, { IFollow } from './db.models/follow.model'
import { FindUsersBySearchQueryDto, SignUpDto } from './dtos'
import { SearchUser } from './graphql.models'
import { Types } from 'mongoose'


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
}