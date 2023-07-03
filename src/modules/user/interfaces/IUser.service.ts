import { SignUpDto } from '../dtos/sign-up.dto'
import { AuthUserModel } from '../graphql.models/auth-user.model'


export interface IUserService {
    signUp(signUpDto: SignUpDto): Promise<AuthUserModel>
}