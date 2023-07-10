import { ObjectType, Field } from 'type-graphql'
import { UserModel } from '../../user/graphql.models/user.model'
import { MessageModel } from './message.model'


@ObjectType()
export class ChatModel {

    @Field()
    _id!: string

    @Field(() => UserModel)
    creator!: UserModel

    @Field(() => [UserModel])
    chatMembers!: UserModel[]

    @Field(() => MessageModel)
    message!: MessageModel
}