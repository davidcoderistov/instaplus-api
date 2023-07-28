import { ObjectType, Field } from 'type-graphql'
import { User } from '../../user/graphql.models'
import { Reaction } from './reaction.model'
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

    @Field({ nullable: true })
    previewPhotoUrl?: string

    @Field(() => [String], { nullable: true })
    seenByUserIds?: string[]

    @Field(() => Message, { nullable: true })
    reply?: Message

    @Field(() => [Reaction], { nullable: true })
    reactions?: Reaction[]

    @Field()
    createdAt!: Date
}