import { ObjectType, Field } from 'type-graphql'
import { Chat } from './chat.model'
import { Message } from './message.model'


@ObjectType()
export class ChatWithLatestMessage {

    @Field(() => Chat)
    chat!: Chat

    @Field(() => Message, { nullable: true })
    message?: Message
}