import { ObjectType, Field } from 'type-graphql'
import { User } from '../../user/graphql.models'
import { Types } from 'mongoose'


@ObjectType()
export class Chat {

    @Field(() => String)
    _id!: Types.ObjectId

    @Field(() => User)
    creator!: User

    @Field(() => [User])
    chatMembers!: User[]

    @Field()
    createdAt!: Date
}