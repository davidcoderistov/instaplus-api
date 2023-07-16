import { ObjectType } from 'type-graphql'
import { CursorPaginatedResponseFactory } from '../../../shared/graphql/cursor-paginated-response-factory'
import { Message } from './message.model'


@ObjectType()
export class Messages extends CursorPaginatedResponseFactory<Message>(Message) {
}