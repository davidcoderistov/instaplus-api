import { ObjectType, Field } from 'type-graphql'
import { Types } from 'mongoose'


@ObjectType()
export class Hashtag {

    @Field(() => String)
    _id!: Types.ObjectId

    @Field(() => String)
    name!: string

    @Field(() => [String])
    postIds!: string[]
}