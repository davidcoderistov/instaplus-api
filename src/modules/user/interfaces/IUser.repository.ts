import { SignUpDto, FindUsersBySearchQueryDto } from '../dtos'
import { IUser } from '../db.models/user.model'
import { IFollow } from '../db.models/follow.model'


export interface IUserRepository {
    createUser(signUpDto: SignUpDto): Promise<Omit<IUser, 'password' | 'refreshToken'>>

    findUserById(id: string): Promise<IUser | null>

    findUsersByIds(ids: string[]): Promise<IUser[]>

    findUserByUsername(username: string): Promise<IUser | null>

    findUsersBySearchQuery(findUsersBySearchQueryDto: FindUsersBySearchQueryDto): Promise<IUser[]>

    updateUserById(id: string, user: Partial<IUser>): Promise<IUser | null>

    findFollowByUserIds(followingUserId: string, followedUserId: string): Promise<IFollow | null>

    followUser(followingUserId: string, followedUserId: string): Promise<IFollow>
}