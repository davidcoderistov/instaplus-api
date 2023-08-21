import { ObjectType, Field } from 'type-graphql'
import { Types } from 'mongoose'


@ObjectType()
export class PostLike {

    @Field(() => String)
    _id!: Types.ObjectId

    @Field(() => String)
    postId!: string

    @Field(() => [String])
    userId!: string[]

    @Field()
    createdAt!: Date
}