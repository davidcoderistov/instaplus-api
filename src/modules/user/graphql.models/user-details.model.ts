import { ObjectType, Field, Int } from 'type-graphql'
import { FollowableUser } from './followable-user.model'


@ObjectType()
export class UserDetails {

    @Field(() => FollowableUser)
    followableUser!: FollowableUser

    @Field(() => Int)
    postsCount!: number

    @Field(() => Int)
    followingCount!: number

    @Field(() => Int)
    followersCount!: number

    @Field(() => Int)
    mutualFollowersCount!: number

    @Field(() => [String])
    latestTwoMutualFollowersUsernames!: string[]
}