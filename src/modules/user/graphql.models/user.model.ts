import { ObjectType, Field } from 'type-graphql'
import { Types } from 'mongoose'


@ObjectType()
export class User {

    @Field(() => String)
    _id!: Types.ObjectId

    @Field()
    firstName!: string

    @Field()
    lastName!: string

    @Field()
    username!: string

    @Field(() => String,{ nullable: true })
    photoUrl?: string | null
}