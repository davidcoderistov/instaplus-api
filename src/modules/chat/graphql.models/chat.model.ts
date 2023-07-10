import { ObjectType, Field } from 'type-graphql'
import { User } from '../../user/graphql.models'


@ObjectType()
export class Chat {

    @Field()
    _id!: string

    @Field(() => User)
    creator!: User

    @Field(() => [User])
    chatMembers!: User[]

    @Field()
    createdAt!: Date
}