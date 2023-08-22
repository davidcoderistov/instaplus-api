import { ObjectType } from 'type-graphql'
import { CursorPaginatedResponseFactory } from '../../../shared/graphql/cursor-paginated-response-factory'
import { FollowableUser } from '../../user/graphql.models'


@ObjectType()
export class UsersWhoLikedComment extends CursorPaginatedResponseFactory<FollowableUser>(FollowableUser) {
}