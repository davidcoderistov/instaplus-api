import { ObjectType, Field, Int } from 'type-graphql'
import { User } from './user.model'


@ObjectType()
export class SearchUser {

    @Field(() => User)
    user!: User

    @Field(() => User, { nullable: true })
    latestFollower?: User | null

    @Field(() => Int)
    followersCount!: number
}