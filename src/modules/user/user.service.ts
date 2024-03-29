import { inject, injectable } from 'inversify'
import { IUserRepository } from './interfaces/IUser.repository'
import { IPostRepository } from '../post/interfaces/IPost.repository'
import { IChatRepository } from '../chat/interfaces/IChat.repository'
import { INotificationRepository } from '../notification/interfaces/INotification.repository'
import { IFileRepository } from '../file/IFile.repository'
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
    UpdateUserDto,
    ChangePasswordDto,
    ChangeProfilePhotoDto,
} from './dtos'
import {
    AuthUser,
    User,
    FollowableUser,
    FollowingForUser,
    FollowersForUser,
    UserDetails,
    SuggestedUser,
} from './graphql.models'
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
        @inject(TYPES.IPostRepository) private readonly _postRepository: IPostRepository,
        @inject(TYPES.INotificationRepository) private readonly _notificationRepository: INotificationRepository,
        @inject(TYPES.IChatRepository) private readonly _chatRepository: IChatRepository,
        @inject(TYPES.IFileRepository) private readonly _fileRepository: IFileRepository) {
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
                createdAt: new Date(),
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
                    createdAt: new Date(),
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
                    createdAt: new Date(),
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
                    createdAt: new Date(),
                }
            } else {
                return Promise.reject(new InvalidSessionException())
            }
        } catch (err) {
            throw new InvalidSessionException()
        }
    }

    public async updateUser(updateUserDto: UpdateUserDto, userId: string): Promise<AuthUser> {
        try {
            const refreshToken = generateRefreshToken(userId)

            const updatedUser = await this._userRepository.updateUserById(userId, {
                firstName: updateUserDto.firstName,
                lastName: updateUserDto.lastName,
                username: updateUserDto.username,
                refreshToken,
            })

            if (updatedUser) {
                this.updateEmbeddedUser(updatedUser)
                return {
                    user: updatedUser,
                    refreshToken,
                    accessToken: generateAccessToken(userId),
                    createdAt: new Date(),
                }
            }

            return Promise.reject(new CustomValidationException('_id', `User with id ${userId} does not exist`))
        } catch (err) {
            if (err instanceof MongoError) {
                if (err.code === 11000) {
                    throw new CustomValidationException('username', `${updateUserDto.username} already exists`)
                }
            } else if (err instanceof Error.ValidationError) {
                throw new ValidationException(err)
            }
            throw new MongodbServerException('Could not sign up. Please try again later')
        }
    }

    public async changePassword({
                                    oldPassword,
                                    newPassword,
                                    confirmNewPassword,
                                }: ChangePasswordDto, userId: string): Promise<AuthUser> {
        try {
            const findUser = await this._userRepository.findUserById(userId)
            if (!findUser) {
                return Promise.reject(new CustomValidationException('_id', `User with id ${userId} does not exist`))
            }

            if (newPassword !== confirmNewPassword) {
                return Promise.reject(new CustomValidationException('confirmNewPassword', 'Passwords do not match'))
            }

            const passwordMatch = await bcrypt.compare(oldPassword, findUser.password)
            if (!passwordMatch) {
                return Promise.reject(new CustomValidationException('oldPassword', 'Wrong old password'))
            }

            const password = await bcrypt.hash(newPassword, 10)

            const refreshToken = generateRefreshToken(userId)

            const updatedUser = await this._userRepository.updateUserById(userId, {
                password,
                refreshToken,
            })

            if (updatedUser) {
                return {
                    user: updatedUser,
                    refreshToken,
                    accessToken: generateAccessToken(userId),
                    createdAt: new Date(),
                }
            }

            return Promise.reject(new CustomValidationException('_id', `User with id ${userId} does not exist`))
        } catch (err) {
            throw new MongodbServerException('Could not change password. Please try again later')
        }
    }

    public async changeProfilePhoto({ photo }: ChangeProfilePhotoDto, userId: string): Promise<AuthUser> {
        try {
            const { photoUrl } = await this._fileRepository.storeUpload(photo, '/instaplus/storage/avatars', {
                height: 180,
                width: 180,
            })

            const updatedUser = await this._userRepository.updateUserById(userId, {
                photoUrl,
            })

            if (updatedUser) {
                this.updateEmbeddedUser(updatedUser)
                return {
                    user: updatedUser,
                    refreshToken: updatedUser.refreshToken,
                    accessToken: generateAccessToken(userId),
                    createdAt: new Date(),
                }
            }

            return Promise.reject(new CustomValidationException('_id', `User with id ${userId} does not exist`))
        } catch (err) {
            throw new MongodbServerException('Could not change profile photo. Please try again later')
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
            const followingUser = await this._userRepository.findUserById(followingUserId)
            if (!followingUser) {
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
            this._notificationRepository.createFollowNotification({
                _id: followingUser._id,
                username: followingUser.username,
                photoUrl: followingUser.photoUrl,
            }, followedUserId)
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

    public async findSuggestedUsers(userId: string): Promise<SuggestedUser[]> {
        try {
            if (!await this._userRepository.findUserById(userId)) {
                return Promise.reject(new CustomValidationException('userId', `User with id ${userId} does not exist`))
            }

            const followedUsersIds = await this._userRepository.findFollowedUserIds(userId)

            const usersWithFollowedCount = await this._userRepository.findFollowersOfFollowedCountByUser(userId, followedUsersIds)

            const userPostLikesIds = await this._postRepository.findLikedPostIdsByFollowersAndUser(userId, followedUsersIds)

            const usersWithPostLikesCount = await this._postRepository.findLikedPostsCountsByFollowersAndUser(userId, followedUsersIds, userPostLikesIds)

            const usersWithCommentsCount = await this._postRepository.findLikedCommentsCountsByFollowersAndUser(userId, followedUsersIds, userPostLikesIds)

            const suggestedUsersWithCount: { [key: string]: number } = [
                ...usersWithFollowedCount,
                ...usersWithPostLikesCount,
                ...usersWithCommentsCount,
            ].reduce((users: { [key: string]: number }, user) => ({
                ...users,
                [user._id]: (users[user._id] ?? 0) + user.count,
            }), {})

            const allSuggestedUsersIds = Object
                .keys(suggestedUsersWithCount)
                .sort((a, b) => suggestedUsersWithCount[b] - suggestedUsersWithCount[a])

            const suggestedUsersIds = allSuggestedUsersIds.slice(0, 15)

            const suggestedUsers = await this._userRepository.findSuggestedUsers(suggestedUsersIds, followedUsersIds)

            return suggestedUsers
                .sort((a, b) => {
                    const countWeight = suggestedUsersWithCount[b.followableUser.user._id.toString()] - suggestedUsersWithCount[a.followableUser.user._id.toString()]
                    if (countWeight === 0) {
                        const followersCount = b.followersCount - a.followersCount
                        if (followersCount === 0) {
                            return a.followableUser.user.username.toLowerCase().localeCompare(b.followableUser.user.username.toLowerCase())
                        }
                        return followersCount
                    }
                    return countWeight
                })
        } catch (err) {
            throw err
        }
    }

    private updateEmbeddedUser(user: IUser) {
        const fullUser = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            photoUrl: user.photoUrl,
        }

        const partialUser = {
            _id: user._id,
            username: user.username,
            photoUrl: user.photoUrl,
        }

        this._chatRepository.updateChatsByCreator(fullUser)
        this._chatRepository.updateChatsByChatMember(fullUser)

        this._chatRepository.updateMessagesByCreator(partialUser)
        this._chatRepository.updateMessagesByReplyCreator(partialUser)
        this._chatRepository.updateMessagesByReactionCreator(fullUser)

        this._notificationRepository.updateNotificationsByUser(partialUser)

        this._postRepository.updatePostsByCreator(fullUser)
        this._postRepository.updateCommentsByCreator(partialUser)
    }
}