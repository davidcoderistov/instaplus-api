import { SignUpDto, FindUsersBySearchQueryDto, FindFollowingForUserDto, FindFollowersForUserDto } from '../dtos'
import { IUser } from '../db.models/user.model'
import { IFollow } from '../db.models/follow.model'
import { SearchUser, FollowingForUser, FollowersForUser, SuggestedUser } from '../graphql.models'


export interface IUserRepository {
    createUser(signUpDto: SignUpDto): Promise<Omit<IUser, 'password' | 'refreshToken'>>

    findUserById(id: string): Promise<IUser | null>

    findUsersByIds(ids: string[]): Promise<IUser[]>

    findUserByUsername(username: string): Promise<IUser | null>

    findUsersBySearchQuery(findUsersBySearchQueryDto: FindUsersBySearchQueryDto): Promise<IUser[]>

    findSearchUsersBySearchQuery(userId: string, searchQuery: string, limit: number): Promise<SearchUser[]>

    findSearchUsersByIds(userId: string, ids: string[], limit: number): Promise<SearchUser[]>

    findFollowedUserIds(userId: string): Promise<string[]>

    updateUserById(id: string, user: Partial<IUser>): Promise<IUser | null>

    findFollowByUserIds(followingUserId: string, followedUserId: string): Promise<IFollow | null>

    followUser(followingUserId: string, followedUserId: string): Promise<IFollow>

    unfollowUser(followingUserId: string, followedUserId: string): Promise<IFollow | null>

    findFollowingForUser(findFollowingForUserDto: FindFollowingForUserDto, userId: string): Promise<FollowingForUser>

    findFollowersForUser(findFollowersForUserDto: FindFollowersForUserDto, userId: string): Promise<FollowersForUser>

    findFollowingCount(userId: string): Promise<number>

    findFollowersCount(userId: string): Promise<number>

    findMutualFollowersIds(userId: string, followedUsersIds: string[]): Promise<string[]>

    findFollowersOfFollowedCountByUser(userId: string, followedUsersIds: string[]): Promise<{ _id: string, count: number }[]>

    findSuggestedUsers(suggestedUsersIds: string[], followedUsersIds: string[]): Promise<SuggestedUser[]>

    findPopularUsersCountsByFollowedConnections(userId: string, followedUsersIds: string[]): Promise<{ _id: string, count: number }[]>

    findPopularUsersExcludedIdsByFollowedConnections(userId: string, followedUsersIds: string[], popularUsersIds: string[]): Promise<string[]>
}