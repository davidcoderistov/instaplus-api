import { ObjectType, Field, Int } from 'type-graphql'
import { Types } from 'mongoose'


@ObjectType()
export class Hashtag {

    @Field(() => String)
    _id!: Types.ObjectId

    @Field(() => String)
    name!: string

    @Field(() => Int)
    postsCount!: number
}