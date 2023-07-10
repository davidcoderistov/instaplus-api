import { ObjectType } from 'type-graphql'
import { PaginatedResponseFactory } from '../../../shared/graphql/paginated-response-factory'
import { ChatWithLatestMessageModel } from './chat-with-latest-message.model'


@ObjectType()
export class ChatsWithLatestMessageModel extends PaginatedResponseFactory<ChatWithLatestMessageModel>(ChatWithLatestMessageModel) {
}