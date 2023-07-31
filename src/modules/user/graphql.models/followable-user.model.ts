import { ObjectType, Field } from 'type-graphql'
import { User } from './user.model'


@ObjectType()
export class FollowableUser {

    @Field(() => User)
    user!: User

    @Field(() => Boolean)
    following!: boolean
}