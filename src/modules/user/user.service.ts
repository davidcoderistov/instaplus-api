import { inject, injectable } from 'inversify'
import { IUserRepository } from './interfaces/IUser.repository'
import { IUserService } from './interfaces/IUser.service'
import { SignUpDto } from './dtos/sign-up.dto'
import { SignInDto } from './dtos/sign-in.dto'
import { AuthUserModel } from './graphql.models/auth-user.model'
import { TYPES } from '../../container/types'
import bcrypt from 'bcrypt'
import { generateAccessToken, generateRefreshToken } from '../../shared/utils/token'
import { MongoError } from 'mongodb'
import { Error } from 'mongoose'
import { CustomValidationException } from '../../shared/exceptions/custom.validation.exception'
import { ValidationException } from '../../shared/exceptions/validation.exception'
import { MongodbServerException } from '../../shared/exceptions/mongodb.server.exception'


@injectable()
export class UserService implements IUserService {

    constructor(
        @inject(TYPES.IUserRepository) private readonly _userRepository: IUserRepository) {
    }

    public async signUp(signUpDto: SignUpDto): Promise<AuthUserModel> {
        try {
            const passwordHash = await bcrypt.hash(signUpDto.password, 10)
            const user = await this._userRepository.createUser({
                ...signUpDto,
                password: passwordHash,
            })
            return {
                user,
                accessToken: user.accessToken,
            }
        } catch (err) {
            if (err instanceof MongoError) {
                if (err.code === 11000) {
                    throw new CustomValidationException('username', `${signUpDto.username} already exists`)
                }
            } else if (err instanceof Error.ValidationError) {
                throw new ValidationException(err)
            }
            throw new MongodbServerException('Could not sign up. Please try again later')
        }
    }

    public async signIn(signInDto: SignInDto): Promise<AuthUserModel> {
        try {
            const user = await this._userRepository.findUserByUsername(signInDto.username)
            if (!user) {
                return Promise.reject(new CustomValidationException('username', `User ${signInDto.username} does not exist`))
            }

            const passwordMatch = await bcrypt.compare(signInDto.password, user.password)
            if (!passwordMatch) {
                return Promise.reject(new CustomValidationException('password', 'Wrong password'))
            }

            const userId = user._id.toString()
            const refreshToken = generateRefreshToken(userId)
            const updatedUser = await this._userRepository.updateUserById(userId, { refreshToken })
            if (updatedUser) {
                return {
                    user: updatedUser,
                    accessToken: generateAccessToken(userId),
                    refreshToken: updatedUser.refreshToken,
                }
            } else {
                return Promise.reject(new MongodbServerException(`User ${signInDto.username} does not exist`))
            }
        } catch (err) {
            throw new MongodbServerException('Could not sign in. Please try again later')
        }
    }
}