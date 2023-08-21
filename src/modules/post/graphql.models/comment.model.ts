import { ObjectType, Field, Int } from 'type-graphql'
import { User } from '../../user/graphql.models'
import { Types } from 'mongoose'


@ObjectType()
export class Comment {

    @Field(() => String)
    _id!: Types.ObjectId

    @Field(() => String)
    text!: string

    @Field(() => User)
    creator!: User

    @Field(() => String)
    postId!: string

    @Field(() => Boolean)
    liked!: boolean

    @Field(() => Int)
    likesCount!: number

    @Field(() => Int)
    repliesCount!: number

    @Field()
    createdAt!: Date
}