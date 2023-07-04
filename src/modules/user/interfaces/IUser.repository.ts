import { SignUpDto } from '../dtos/sign-up.dto'
import { IUser } from '../user.model'


export interface IUserRepository {
    createUser(signUpDto: SignUpDto): Promise<Omit<IUser, 'password' | 'refreshToken'>>

    findUserByUsername(username: string): Promise<IUser | null>

    updateUserById(id: string, user: Partial<IUser>): Promise<IUser | null>
}