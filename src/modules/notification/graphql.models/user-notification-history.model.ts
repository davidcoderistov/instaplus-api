import { ObjectType, Field } from 'type-graphql'
import { Types } from 'mongoose'


@ObjectType()
export class UserNotificationHistory {

    @Field(() => String)
    _id!: Types.ObjectId

    @Field(() => String)
    userId!: string

    @Field()
    createdAt!: Date
}