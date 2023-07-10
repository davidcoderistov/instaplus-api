import { ObjectType, Field } from 'type-graphql'
import { User } from '../../user/graphql.models'


@ObjectType()
export class Message {

    @Field()
    _id!: string

    @Field(() => User)
    creator!: User

    @Field({ nullable: true })
    text?: string

    @Field({ nullable: true })
    photoUrl?: string

    @Field({ nullable: true })
    videoUrl?: string

    @Field()
    createdAt!: Date
}