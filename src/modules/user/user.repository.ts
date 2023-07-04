import { injectable } from 'inversify'
import { IUserRepository } from './interfaces/IUser.repository'
import UserModel from './user.model'
import { SignUpDto } from './dtos'
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

    public async findUserById(id: string): Promise<IUser | null> {
        const user = await UserModel.findById(id)
        return user ? user.toObject() : null
    }

    public async findUserByUsername(username: string): Promise<IUser | null> {
        const user = await UserModel.findOne({ username })
        return user ? user.toObject() : null
    }

    public async updateUserById(id: string, user: Partial<IUser>): Promise<IUser | null> {
        const updateUser = await UserModel.findOneAndUpdate({ _id: id }, user, { new: true })
        return updateUser ? updateUser.toObject() : null
    }
}