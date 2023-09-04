import { inject, injectable } from 'inversify'
import { Resolver, Query, Mutation, Args, Arg, Ctx } from 'type-graphql'
import { TYPES } from '../../container/types'
import { IUserService } from './interfaces/IUser.service'
import {
    SignUpDto,
    SignInDto,
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
import { Context } from '../../shared/types'


@injectable()
@Resolver()
export class UserResolver {

    constructor(
        @inject(TYPES.IUserService) private readonly _userService: IUserService) {
    }

    @Mutation(() => AuthUser)
    public async signUp(@Args() signUpDto: SignUpDto): Promise<AuthUser> {
        return this._userService.signUp(signUpDto)
    }

    @Mutation(() => AuthUser)
    public async signIn(@Args() signInDto: SignInDto, @Ctx() { setRefreshTokenCookie }: Context): Promise<AuthUser> {
        const user = await this._userService.signIn(signInDto)
        setRefreshTokenCookie(user.refreshToken as string)
        return user
    }

    @Mutation(() => AuthUser)
    public async refresh(@Ctx() { getRefreshTokenCookie, setRefreshTokenCookie }: Context): Promise<AuthUser> {
        const refreshToken = getRefreshTokenCookie()
        const user = await this._userService.refresh({ refreshToken })
        setRefreshTokenCookie(user.refreshToken as string)
        return user
    }

    @Mutation(() => AuthUser)
    public async logout(@Ctx() { getRefreshTokenCookie, setRefreshTokenCookie }: Context): Promise<AuthUser> {
        const refreshToken = getRefreshTokenCookie()
        const user = await this._userService.logout({ refreshToken })
        setRefreshTokenCookie('', true)
        return user
    }

    @Mutation(() => AuthUser)
    public async updateUser(@Args() updateUserDto: UpdateUserDto, @Ctx() {
        setRefreshTokenCookie,
        userId,
    }: Context): Promise<AuthUser> {
        const user = await this._userService.updateUser(updateUserDto, userId)
        setRefreshTokenCookie(user.refreshToken as string)
        return user
    }

    @Mutation(() => AuthUser)
    public async changePassword(@Args() changePasswordDto: ChangePasswordDto, @Ctx() {
        setRefreshTokenCookie,
        userId,
    }: Context): Promise<AuthUser> {
        const user = await this._userService.changePassword(changePasswordDto, userId)
        setRefreshTokenCookie(user.refreshToken as string)
        return user
    }

    @Mutation(() => AuthUser)
    public async changeProfilePhoto(@Args() changeProfilePhotoDto: ChangeProfilePhotoDto, @Ctx() {
        setRefreshTokenCookie,
        userId,
    }: Context): Promise<AuthUser> {
        const user = await this._userService.changeProfilePhoto(changeProfilePhotoDto, userId)
        setRefreshTokenCookie(user.refreshToken as string)
        return user
    }

    @Query(() => [User])
    public async findUsersBySearchQuery(@Args() findUsersBySearchQuery: FindUsersBySearchQueryDto, @Ctx() { userId }: Context): Promise<User[]> {
        return this._userService.findUsersBySearchQuery(findUsersBySearchQuery, userId)
    }

    @Mutation(() => FollowableUser)
    public async followUser(@Arg('followedUserId') followedUserId: string, @Ctx() { userId }: Context): Promise<FollowableUser> {
        return this._userService.followUser(userId, followedUserId)
    }

    @Mutation(() => FollowableUser)
    public async unfollowUser(@Arg('followedUserId') followedUserId: string, @Ctx() { userId }: Context): Promise<FollowableUser> {
        return this._userService.unfollowUser(userId, followedUserId)
    }

    @Query(() => FollowingForUser)
    public async findFollowingForUser(@Args() findFollowingForUserDto: FindFollowingForUserDto, @Ctx() { userId }: Context): Promise<FollowingForUser> {
        return this._userService.findFollowingForUser(findFollowingForUserDto, userId)
    }

    @Query(() => FollowersForUser)
    public async findFollowersForUser(@Args() findFollowersForUserDto: FindFollowersForUserDto, @Ctx() { userId }: Context): Promise<FollowersForUser> {
        return this._userService.findFollowersForUser(findFollowersForUserDto, userId)
    }

    @Query(() => UserDetails)
    public async findUserDetails(@Args() findUserDetailsDto: FindUserDetailsDto, @Ctx() { userId }: Context): Promise<UserDetails> {
        return this._userService.findUserDetails(findUserDetailsDto, userId)
    }

    @Query(() => [SuggestedUser])
    public async findSuggestedUsers(@Ctx() { userId }: Context): Promise<SuggestedUser[]> {
        return this._userService.findSuggestedUsers(userId)
    }
}