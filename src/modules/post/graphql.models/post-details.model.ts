import { ObjectType, Field, Int } from 'type-graphql'
import { Post } from './post.model'
import { User } from '../../user/graphql.models'
import { Types } from 'mongoose'


@ObjectType()
export class PostDetails {

    @Field(() => String)
    _id!: Types.ObjectId

    @Field(() => Post)
    post!: Post

    @Field(() => Boolean)
    liked!: boolean

    @Field(() => Boolean)
    saved!: boolean

    @Field(() => Int)
    commentsCount!: number

    @Field(() => Int)
    likesCount!: number

    @Field(() => User, { nullable: true })
    latestLikeUser?: string | null

    @Field(() => [User])
    latestThreeFollowedLikeUsers!: User[]
}