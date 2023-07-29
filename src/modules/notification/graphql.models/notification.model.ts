import { ObjectType, Field } from 'type-graphql'
import { Types } from 'mongoose'
import { User } from '../../user/graphql.models'
import { Post } from '../../post/graphql.models/post.model'


@ObjectType()
export class Notification {

    @Field(() => String)
    _id!: Types.ObjectId

    @Field(() => String)
    type!: 'follow' | 'like' | 'comment'

    @Field(() => String)
    userId!: string

    @Field(() => User)
    user!: User

    @Field(() => Post, { nullable: true })
    post?: Post | null

    @Field()
    createdAt!: Date
}