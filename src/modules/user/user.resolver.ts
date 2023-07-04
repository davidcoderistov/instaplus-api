import { inject, injectable } from 'inversify'
import { Resolver, Mutation, Args } from 'type-graphql'
import { TYPES } from '../../container/types'
import { IUserService } from './interfaces/IUser.service'
import {
    SignUpDto,
    SignInDto,
    RefreshDto,
} from './dtos'
import { AuthUserModel } from './graphql.models/auth-user.model'


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
    public async signIn(@Args() signInDto: SignInDto): Promise<AuthUserModel> {
        return this._userService.signIn(signInDto)
    }

    @Mutation(() => AuthUserModel)
    public async refresh(@Args() refreshDto: RefreshDto): Promise<AuthUserModel> {
        return this._userService.refresh(refreshDto)
    }

    @Mutation(() => AuthUserModel)
    public async logout(@Args() refreshDto: RefreshDto): Promise<AuthUserModel> {
        return this._userService.logout(refreshDto)
    }
}