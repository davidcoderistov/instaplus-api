import { ObjectType } from 'type-graphql'
import { PaginatedResponseFactory } from '../../../shared/graphql/paginated-response-factory'
import { Message } from './message.model'


@ObjectType()
export class Messages extends PaginatedResponseFactory<Message>(Message) {
}