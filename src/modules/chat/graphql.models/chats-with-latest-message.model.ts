import { ObjectType } from 'type-graphql'
import { PaginatedResponseFactory } from '../../../shared/graphql/paginated-response-factory'
import { ChatWithLatestMessage } from './chat-with-latest-message.model'


@ObjectType()
export class ChatsWithLatestMessage extends PaginatedResponseFactory<ChatWithLatestMessage>(ChatWithLatestMessage) {
}