import { ObjectType, Field } from 'type-graphql'
import { UserModel } from '../../user/graphql.models'


@ObjectType()
export class ChatModel {

    @Field()
    _id!: string

    @Field(() => UserModel)
    creator!: UserModel

    @Field(() => [UserModel])
    chatMembers!: UserModel[]

    @Field()
    createdAt!: Date
}