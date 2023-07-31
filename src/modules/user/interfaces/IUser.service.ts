import {
    SignUpDto,
    SignInDto,
    RefreshDto,
    FindUsersBySearchQueryDto,
} from '../dtos'
import { AuthUser, User, FollowableUser } from '../graphql.models'


export interface IUserService {
    signUp(signUpDto: SignUpDto): Promise<AuthUser>

    signIn(signInDto: SignInDto): Promise<AuthUser>

    refresh(refreshDto: RefreshDto): Promise<AuthUser>

    logout(refreshDto: RefreshDto): Promise<AuthUser>

    findUsersBySearchQuery(findUsersBySearchQueryDto: FindUsersBySearchQueryDto, authUserId: string): Promise<User[]>

    followUser(followingUserId: string, followedUserId: string): Promise<FollowableUser>

    unfollowUser(followingUserId: string, followedUserId: string): Promise<FollowableUser>
}