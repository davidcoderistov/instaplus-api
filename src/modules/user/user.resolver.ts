import { inject, injectable } from 'inversify'
import { Resolver, Query, Mutation, Args, Arg, Ctx } from 'type-graphql'
import { TYPES } from '../../container/types'
import { IUserService } from './interfaces/IUser.service'
import {
    SignUpDto,
    SignInDto,
    FindUsersBySearchQueryDto,
    FindFollowingForUserDto,
} from './dtos'
import { AuthUser, User, FollowableUser, FollowingForUser } from './graphql.models'
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
}