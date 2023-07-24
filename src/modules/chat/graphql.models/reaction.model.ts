import { ObjectType, Field } from 'type-graphql'
import { User } from '../../user/graphql.models'
import { Types } from 'mongoose'


@ObjectType()
export class Reaction {

    @Field(() => String)
    _id!: Types.ObjectId

    @Field()
    reaction!: string

    @Field(() => User)
    creator!: User
}