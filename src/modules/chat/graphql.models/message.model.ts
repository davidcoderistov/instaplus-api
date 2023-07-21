import { ObjectType, Field } from 'type-graphql'
import { User } from '../../user/graphql.models'
import { Types } from 'mongoose'


@ObjectType()
export class Message {

    @Field(() => String)
    _id!: Types.ObjectId

    @Field()
    chatId!: string

    @Field(() => User)
    creator!: User

    @Field({ nullable: true })
    text?: string

    @Field({ nullable: true })
    photoUrl?: string

    @Field({ nullable: true })
    photoOrientation?: string

    @Field(() => [String], { nullable: true })
    seenByUserIds?: string[]

    @Field(() => Message, { nullable: true })
    reply?: Message

    @Field()
    createdAt!: Date
}