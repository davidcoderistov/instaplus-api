import {
    SignUpDto,
    SignInDto,
    RefreshDto,
    FindUsersBySearchQueryDto,
} from '../dtos'
import { AuthUserModel, UserModel } from '../graphql.models'


export interface IUserService {
    signUp(signUpDto: SignUpDto): Promise<AuthUserModel>

    signIn(signInDto: SignInDto): Promise<AuthUserModel>

    refresh(refreshDto: RefreshDto): Promise<AuthUserModel>

    logout(refreshDto: RefreshDto): Promise<AuthUserModel>

    findUsersBySearchQuery(findUsersBySearchQueryDto: FindUsersBySearchQueryDto, authUserId: string): Promise<UserModel[]>
}