import { SignUpDto, FindUsersBySearchQueryDto } from '../dtos'
import { IUser } from '../user.model'


export interface IUserRepository {
    createUser(signUpDto: SignUpDto): Promise<Omit<IUser, 'password' | 'refreshToken'>>

    findUserById(id: string): Promise<IUser | null>

    findUsersByIds(ids: string[]): Promise<IUser[]>

    findUserByUsername(username: string): Promise<IUser | null>

    findUsersBySearchQuery(findUsersBySearchQueryDto: FindUsersBySearchQueryDto): Promise<IUser[]>

    updateUserById(id: string, user: Partial<IUser>): Promise<IUser | null>
}