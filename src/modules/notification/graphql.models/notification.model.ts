import { ObjectType, Field, Int } from 'type-graphql'
import { Types } from 'mongoose'
import { User } from '../../user/graphql.models'
import { Post } from '../../post/graphql.models'


@ObjectType()
export class Notification {

    @Field(() => String)
    _id!: Types.ObjectId

    @Field(() => String)
    type!: 'follow' | 'like' | 'comment'

    @Field(() => String)
    userId!: string

    @Field(() => [User])
    latestUsers!: User[]

    @Field(() => Int)
    usersCount!: number

    @Field(() => Post, { nullable: true })
    post?: Post | null

    @Field()
    createdAt!: Date
}