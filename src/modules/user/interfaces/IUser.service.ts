import {
    SignUpDto,
    SignInDto,
    RefreshDto,
} from '../dtos'
import { AuthUserModel } from '../graphql.models/auth-user.model'


export interface IUserService {
    signUp(signUpDto: SignUpDto): Promise<AuthUserModel>

    signIn(signInDto: SignInDto): Promise<AuthUserModel>

    refresh(refreshDto: RefreshDto): Promise<AuthUserModel>

    logout(refreshDto: RefreshDto): Promise<AuthUserModel>
}