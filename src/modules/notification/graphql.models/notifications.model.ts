import { ObjectType } from 'type-graphql'
import { OffsetPaginatedResponseFactory } from '../../../shared/graphql/offset-paginated-response-factory'
import { Notification } from './notification.model'


@ObjectType()
export class Notifications extends OffsetPaginatedResponseFactory<Notification>(Notification) {
}