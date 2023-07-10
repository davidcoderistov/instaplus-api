import { ObjectType, Field } from 'type-graphql'
import { UserModel } from '../../user/graphql.models/user.model'


@ObjectType()
export class MessageModel {

    @Field()
    _id!: string

    @Field(() => UserModel)
    creator!: UserModel

    @Field({ nullable: true })
    text?: string

    @Field({ nullable: true })
    photoUrl?: string

    @Field({ nullable: true })
    videoUrl?: string

    @Field()
    createdAt!: Date
}