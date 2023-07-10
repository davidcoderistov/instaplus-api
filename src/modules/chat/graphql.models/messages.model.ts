import { ObjectType } from 'type-graphql'
import { PaginatedResponseFactory } from '../../../shared/graphql/paginated-response-factory'
import { MessageModel } from './message.model'


@ObjectType()
export class MessagesModel extends PaginatedResponseFactory<MessageModel>(MessageModel) {
}