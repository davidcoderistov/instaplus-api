import { injectable } from 'inversify'
import { IUserRepository } from './interfaces/IUser.repository'
import UserModel from './user.model'
import { SignUpDto } from './dtos/sign-up.dto'
import { IUser } from './user.model'


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
}