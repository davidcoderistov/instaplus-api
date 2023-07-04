import { inject, injectable } from 'inversify'
import { Resolver, Mutation, Args, Ctx } from 'type-graphql'
import { TYPES } from '../../container/types'
import { IUserService } from './interfaces/IUser.service'
import {
    SignUpDto,
    SignInDto,
} from './dtos'
import { AuthUserModel } from './graphql.models/auth-user.model'
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
}