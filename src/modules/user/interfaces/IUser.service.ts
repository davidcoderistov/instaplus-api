import {
    SignUpDto,
    SignInDto,
    RefreshDto,
    FindUsersBySearchQueryDto,
    FindFollowingForUserDto,
    FindFollowersForUserDto,
} from '../dtos'
import { AuthUser, User, FollowableUser, FollowingForUser, FollowersForUser } from '../graphql.models'


export interface IUserService {
    signUp(signUpDto: SignUpDto): Promise<AuthUser>

    signIn(signInDto: SignInDto): Promise<AuthUser>

    refresh(refreshDto: RefreshDto): Promise<AuthUser>

    logout(refreshDto: RefreshDto): Promise<AuthUser>

    findUsersBySearchQuery(findUsersBySearchQueryDto: FindUsersBySearchQueryDto, authUserId: string): Promise<User[]>

    followUser(followingUserId: string, followedUserId: string): Promise<FollowableUser>

    unfollowUser(followingUserId: string, followedUserId: string): Promise<FollowableUser>

    findFollowingForUser(findFollowingForUserDto: FindFollowingForUserDto, userId: string): Promise<FollowingForUser>

    findFollowersForUser(findFollowersForUserDto: FindFollowersForUserDto, userId: string): Promise<FollowersForUser>
}