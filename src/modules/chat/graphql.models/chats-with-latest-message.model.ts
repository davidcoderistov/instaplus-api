import { ObjectType } from 'type-graphql'
import { CursorPaginatedResponseFactory } from '../../../shared/graphql/cursor-paginated-response-factory'
import { ChatWithLatestMessage } from './chat-with-latest-message.model'


@ObjectType()
export class ChatsWithLatestMessage extends CursorPaginatedResponseFactory<ChatWithLatestMessage>(ChatWithLatestMessage) {
}