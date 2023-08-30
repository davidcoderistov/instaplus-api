import { ObjectType, Field, Int } from 'type-graphql'
import { User } from './user.model'
import { FollowableUser } from './followable-user.model'


@ObjectType()
export class SuggestedUser {

    @Field(() => FollowableUser)
    followableUser!: FollowableUser

    @Field(() => User, { nullable: true })
    latestFollower?: User | null

    @Field(() => Int)
    followersCount!: number
}