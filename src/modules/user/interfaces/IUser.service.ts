import {
    SignUpDto,
    SignInDto,
    RefreshDto,
    FindUsersBySearchQueryDto,
} from '../dtos'
import { AuthUser, User } from '../graphql.models'


export interface IUserService {
    signUp(signUpDto: SignUpDto): Promise<AuthUser>

    signIn(signInDto: SignInDto): Promise<AuthUser>

    refresh(refreshDto: RefreshDto): Promise<AuthUser>

    logout(refreshDto: RefreshDto): Promise<AuthUser>

    findUsersBySearchQuery(findUsersBySearchQueryDto: FindUsersBySearchQueryDto, authUserId: string): Promise<User[]>
}