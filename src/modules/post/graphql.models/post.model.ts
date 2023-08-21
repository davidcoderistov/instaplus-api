import { ObjectType, Field } from 'type-graphql'
import { FollowableUser } from '../../user/graphql.models'
import { Types } from 'mongoose'


@ObjectType()
export class Post {

    @Field(() => String)
    _id!: Types.ObjectId

    @Field(() => [String])
    photoUrls!: string[]

    @Field(() => String, { nullable: true })
    caption?: string | null

    @Field(() => String, { nullable: true })
    location?: string | null

    @Field(() => FollowableUser)
    creator!: FollowableUser

    @Field()
    createdAt!: Date
}