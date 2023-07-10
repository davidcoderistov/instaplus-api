import { inject, injectable } from 'inversify'
import { Resolver, Query, Mutation, Args, Ctx } from 'type-graphql'
import { TYPES } from '../../container/types'
import { IUserService } from './interfaces/IUser.service'
import {
    SignUpDto,
    SignInDto,
    FindUsersBySearchQueryDto,
} from './dtos'
import { AuthUserModel, UserModel } from './graphql.models'
import { Context } from '../../shared/types'


@injectable()
@Resolver()
export class UserResolver {

    constructor(
        @inject(TYPES.IUserService) private readonly _userService: IUserService) {
    }

    @Mutation(() => AuthUserModel)
    public async signUp(@Args() signUpDto: SignUpDto): Promise<AuthUserModel> {
        return this._userService.signUp(signUpDto)
    }

    @Mutation(() => AuthUserModel)
    public async signIn(@Args() signInDto: SignInDto, @Ctx() { setRefreshTokenCookie }: Context): Promise<AuthUserModel> {
        const user = await this._userService.signIn(signInDto)
        setRefreshTokenCookie(user.refreshToken as string)
        return user
    }

    @Mutation(() => AuthUserModel)
    public async refresh(@Ctx() { getRefreshTokenCookie, setRefreshTokenCookie }: Context): Promise<AuthUserModel> {
        const refreshToken = getRefreshTokenCookie()
        const user = await this._userService.refresh({ refreshToken })
        setRefreshTokenCookie(user.refreshToken as string)
        return user
    }

    @Mutation(() => AuthUserModel)
    public async logout(@Ctx() { getRefreshTokenCookie, setRefreshTokenCookie }: Context): Promise<AuthUserModel> {
        const refreshToken = getRefreshTokenCookie()
        const user = await this._userService.logout({ refreshToken })
        setRefreshTokenCookie('', true)
        return user
    }

    @Query(() => UserModel)
    public async findUsersBySearchQuery(@Args() findUsersBySearchQuery: FindUsersBySearchQueryDto, @Ctx() { userId }: Context): Promise<UserModel[]> {
        return this._userService.findUsersBySearchQuery(findUsersBySearchQuery, userId)
    }
}