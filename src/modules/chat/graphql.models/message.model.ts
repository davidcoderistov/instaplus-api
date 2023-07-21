import { ObjectType, Field } from 'type-graphql'
import { User } from '../../user/graphql.models'
import { Types } from 'mongoose'


@ObjectType()
export class Message {

    @Field(() => String)
    _id!: Types.ObjectId

    @Field(() => User)
    creator!: User

    @Field({ nullable: true })
    text?: string

    @Field({ nullable: true })
    photoUrl?: string

    @Field()
    createdAt!: Date
}