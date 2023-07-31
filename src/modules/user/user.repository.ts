import { injectable } from 'inversify'
import { IUserRepository } from './interfaces/IUser.repository'
import UserModel, { IUser } from './db.models/user.model'
import { FindUsersBySearchQueryDto, SignUpDto } from './dtos'
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

    public async updateUserById(id: string, user: Partial<IUser>): Promise<IUser | null> {
        const updateUser = await UserModel.findOneAndUpdate({ _id: id }, user, { new: true })
        return updateUser ? updateUser.toObject() : null
    }
}