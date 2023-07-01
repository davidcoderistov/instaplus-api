import { ObjectType } from 'type-graphql'
import { PaginatedResponseFactory } from '../../../shared/graphql/paginated-response-factory'
import { ChatModel } from './chat.model'


@ObjectType()
export class ChatsModel extends PaginatedResponseFactory<ChatModel>(ChatModel) {
}