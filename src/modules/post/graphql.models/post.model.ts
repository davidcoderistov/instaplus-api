import { ObjectType, Field } from 'type-graphql'
import { Types } from 'mongoose'


@ObjectType()
export class Post {

    @Field(() => String)
    _id!: Types.ObjectId

    @Field(() => [String])
    photoUrls!: string[]
}