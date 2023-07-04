import { SignUpDto } from '../dtos/sign-up.dto'
import { SignInDto } from '../dtos/sign-in.dto'
import { RefreshDto } from '../dtos/refresh.dto'
import { AuthUserModel } from '../graphql.models/auth-user.model'


export interface IUserService {
    signUp(signUpDto: SignUpDto): Promise<AuthUserModel>

    signIn(signInDto: SignInDto): Promise<AuthUserModel>

    refresh(refreshDto: RefreshDto): Promise<AuthUserModel>
}