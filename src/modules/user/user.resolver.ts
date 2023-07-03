import { inject, injectable } from 'inversify'
import { Resolver, Mutation, Args } from 'type-graphql'
import { TYPES } from '../../container/types'
import { IUserService } from './interfaces/IUser.service'
import { SignUpDto } from './dtos/sign-up.dto'
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
}