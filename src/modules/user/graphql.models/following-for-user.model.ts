import { ObjectType } from 'type-graphql'
import { CursorPaginatedResponseFactory } from '../../../shared/graphql/cursor-paginated-response-factory'
import { FollowableUser } from './followable-user.model'


@ObjectType()
export class FollowingForUser extends CursorPaginatedResponseFactory<FollowableUser>(FollowableUser) {
}