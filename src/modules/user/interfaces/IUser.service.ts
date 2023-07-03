import { SignUpDto } from '../dtos/sign-up.dto'
import { AuthUserModel } from '../graphql.models/auth-user.model'


export interface IUserService {
    createUser(signUpDto: SignUpDto): Promise<AuthUserModel>
}