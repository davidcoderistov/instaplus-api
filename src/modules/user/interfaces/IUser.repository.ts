import { SignUpDto, FindUsersBySearchQueryDto, FindFollowingForUserDto } from '../dtos'
import { IUser } from '../db.models/user.model'
import { IFollow } from '../db.models/follow.model'
import { SearchUser, FollowingForUser } from '../graphql.models'


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
}