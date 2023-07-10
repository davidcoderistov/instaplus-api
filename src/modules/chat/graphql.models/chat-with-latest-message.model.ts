import { ObjectType, Field } from 'type-graphql'
import { ChatModel } from './chat.model'
import { MessageModel } from './message.model'


@ObjectType()
export class ChatWithLatestMessageModel {

    @Field(() => ChatModel)
    chat!: ChatModel

    @Field(() => MessageModel)
    message!: MessageModel
}