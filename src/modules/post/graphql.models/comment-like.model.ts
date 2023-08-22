import { ObjectType, Field } from 'type-graphql'
import { Types } from 'mongoose'


@ObjectType()
export class CommentLike {

    @Field(() => String)
    _id!: Types.ObjectId

    @Field(() => String)
    commentId!: string

    @Field(() => [String])
    userId!: string[]

    @Field()
    createdAt!: Date
}