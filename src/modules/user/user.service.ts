import { inject, injectable } from 'inversify'
import { IUserRepository } from './interfaces/IUser.repository'
import { IUserService } from './interfaces/IUser.service'
import {
    SignUpDto,
    SignInDto,
    RefreshDto,
    FindUsersBySearchQueryDto,
} from './dtos'
import { AuthUser, User, FollowableUser } from './graphql.models'
import { TYPES } from '../../container/types'
import bcrypt from 'bcrypt'
import {
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
} from '../../shared/utils/token'
import { MongoError } from 'mongodb'
import { Error } from 'mongoose'
import {
    CustomValidationException,
    ValidationException,
    MongodbServerException,
    InvalidSessionException,
} from '../../shared/exceptions'


@injectable()
export class UserService implements IUserService {

    constructor(
        @inject(TYPES.IUserRepository) private readonly _userRepository: IUserRepository) {
    }

    public async signUp(signUpDto: SignUpDto): Promise<AuthUser> {
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

    public async signIn(signInDto: SignInDto): Promise<AuthUser> {
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

    public async refresh(refreshDto: RefreshDto): Promise<AuthUser> {
        try {
            if (!refreshDto.refreshToken) {
                return Promise.reject(new InvalidSessionException())
            }

            const decoded = await verifyToken(refreshDto.refreshToken)
            const { id, refresh } = decoded
            if (!id || !refresh) {
                return Promise.reject(new InvalidSessionException())
            }

            const user = await this._userRepository.findUserById(id)
            if (!user || user.refreshToken !== refreshDto.refreshToken) {
                return Promise.reject(new InvalidSessionException())
            }

            const userId = user._id.toString()
            const refreshToken = generateRefreshToken(id)
            const updatedUser = await this._userRepository.updateUserById(userId, { refreshToken })

            if (updatedUser) {
                return {
                    user: updatedUser,
                    accessToken: generateAccessToken(userId),
                    refreshToken: updatedUser.refreshToken,
                }
            } else {
                return Promise.reject(new InvalidSessionException())
            }
        } catch (err) {
            throw new InvalidSessionException()
        }
    }

    public async logout(refreshDto: RefreshDto): Promise<AuthUser> {
        try {
            if (!refreshDto.refreshToken) {
                return Promise.reject(new InvalidSessionException())
            }

            const decoded = await verifyToken(refreshDto.refreshToken)
            const { id, refresh } = decoded
            if (!id || !refresh) {
                return Promise.reject(new InvalidSessionException())
            }

            const user = await this._userRepository.findUserById(id)
            if (!user || user.refreshToken !== refreshDto.refreshToken) {
                return Promise.reject(new InvalidSessionException())
            }

            const userId = user._id.toString()
            const updatedUser = await this._userRepository.updateUserById(userId, { refreshToken: null })

            if (updatedUser) {
                return {
                    user: updatedUser,
                    accessToken: null,
                    refreshToken: null,
                }
            } else {
                return Promise.reject(new InvalidSessionException())
            }
        } catch (err) {
            throw new InvalidSessionException()
        }
    }

    public async findUsersBySearchQuery(findUsersBySearchQueryDto: FindUsersBySearchQueryDto, authUserId: string): Promise<User[]> {
        try {
            const user = await this._userRepository.findUserById(authUserId)
            if (!user) {
                return Promise.reject(new MongodbServerException(`User ${authUserId} does not exist`))
            }

            const users = await this._userRepository.findUsersBySearchQuery(findUsersBySearchQueryDto)
            return users.filter(user => user._id.toString() !== authUserId)
        } catch (err) {
            throw err
        }
    }

    public async followUser(followingUserId: string, followedUserId: string): Promise<FollowableUser> {
        try {
            if (!await this._userRepository.findUserById(followingUserId)) {
                return Promise.reject(new CustomValidationException('followingUserId', `User with id ${followingUserId} does not exist`))
            }

            const followedUser = await this._userRepository.findUserById(followedUserId)
            if (!followedUser) {
                return Promise.reject(new CustomValidationException('followedUserId', `User with id ${followedUserId} does not exist`))
            }

            if (await this._userRepository.findFollowByUserIds(followingUserId, followedUserId)) {
                return Promise.reject(new CustomValidationException('followedUserId', `User ${followingUserId} already follows ${followedUserId}`))
            }

            await this._userRepository.followUser(followingUserId, followedUserId)
            return {
                user: followedUser,
                following: true,
            }
        } catch (err) {
            throw err
        }
    }
}