import { ObjectType } from 'type-graphql'
import { CursorPaginatedResponseFactory } from '../../../shared/graphql/cursor-paginated-response-factory'
import { Notification } from './notification.model'


@ObjectType()
export class Notifications extends CursorPaginatedResponseFactory<Notification>(Notification) {
}