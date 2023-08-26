import { inject, injectable } from 'inversify'
import { IUserRepository } from './interfaces/IUser.repository'
import { IPostRepository } from '../post/interfaces/IPost.repository'
import { IUserService } from './interfaces/IUser.service'
import { IUser } from './db.models/user.model'
import {
    SignUpDto,
    SignInDto,
    RefreshDto,
    FindUsersBySearchQueryDto,
    FindFollowingForUserDto,
    FindFollowersForUserDto,
    FindUserDetailsDto,
} from './dtos'
import { AuthUser, User, FollowableUser, FollowingForUser, FollowersForUser, UserDetails } from './graphql.models'
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
        @inject(TYPES.IUserRepository) private readonly _userRepository: IUserRepository,
        @inject(TYPES.IPostRepository) private readonly _postRepository: IPostRepository) {
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

    public async unfollowUser(followingUserId: string, followedUserId: string): Promise<FollowableUser> {
        try {
            if (!await this._userRepository.findUserById(followingUserId)) {
                return Promise.reject(new CustomValidationException('followingUserId', `User with id ${followingUserId} does not exist`))
            }

            const followedUser = await this._userRepository.findUserById(followedUserId)
            if (!followedUser) {
                return Promise.reject(new CustomValidationException('followedUserId', `User with id ${followedUserId} does not exist`))
            }

            if (!await this._userRepository.unfollowUser(followingUserId, followedUserId)) {
                return Promise.reject(new CustomValidationException('followedUserId', `User ${followingUserId} does not follow ${followedUserId}`))
            }
            return {
                user: followedUser,
                following: false,
            }
        } catch (err) {
            throw err
        }
    }

    public async findFollowingForUser(findFollowingForUserDto: FindFollowingForUserDto, userId: string): Promise<FollowingForUser> {
        return this._userRepository.findFollowingForUser(findFollowingForUserDto, userId)
    }

    public async findFollowersForUser(findFollowersForUserDto: FindFollowersForUserDto, userId: string): Promise<FollowersForUser> {
        return this._userRepository.findFollowersForUser(findFollowersForUserDto, userId)
    }

    public async findUserDetails({ userId }: FindUserDetailsDto, loggedInUserId: string): Promise<UserDetails> {
        try {
            const user = await this._userRepository.findUserById(userId)

            if (!user) {
                return Promise.reject(new CustomValidationException('userId', `User with id ${userId} does not exist`))
            }

            if (!await this._userRepository.findUserById(loggedInUserId)) {
                return Promise.reject(new CustomValidationException('userId', `User with id ${loggedInUserId} does not exist`))
            }

            const [
                postsCountResult,
                followingCountResult,
                followersCountResult,
            ]: (PromiseFulfilledResult<number> | PromiseRejectedResult)[] = await Promise.allSettled([
                this._postRepository.findPostsCount(userId),
                this._userRepository.findFollowingCount(userId),
                this._userRepository.findFollowersCount(userId),
            ])

            let postsCount, followingCount, followersCount = 0

            if (postsCountResult.status === 'fulfilled' && followingCountResult.status === 'fulfilled' && followersCountResult.status === 'fulfilled') {
                postsCount = postsCountResult.value
                followingCount = followingCountResult.value
                followersCount = followersCountResult.value
            } else {
                return Promise.reject(new CustomValidationException('count', `Could not obtain counts`))
            }

            const followedUsersIds = await this._userRepository.findFollowedUserIds(loggedInUserId)

            const following = followedUsersIds.some(id => id === userId)

            const mutualFollowersIds = await this._userRepository.findMutualFollowersIds(userId, followedUsersIds)

            const mutualFollowersCount = mutualFollowersIds.length

            const mutualFollowers: (PromiseFulfilledResult<IUser | null> | PromiseRejectedResult)[] = await Promise.allSettled(mutualFollowersIds.slice(0, 2)
                .map(userId => this._userRepository.findUserById(userId)))

            let latestTwoMutualFollowersUsernames: string[] = []

            mutualFollowers.forEach(result => {
                let found = false
                if (result.status === 'fulfilled') {
                    const user = result.value
                    if (user) {
                        latestTwoMutualFollowersUsernames.push(user.username)
                        found = true
                    }
                }
                if (!found) {
                    return Promise.reject(new CustomValidationException('userId', `Mutual follower does not exist`))
                }
            })

            return {
                followableUser: {
                    user,
                    following,
                },
                postsCount,
                followingCount,
                followersCount,
                mutualFollowersCount,
                latestTwoMutualFollowersUsernames,
            }
        } catch (err) {
            throw err
        }
    }
}