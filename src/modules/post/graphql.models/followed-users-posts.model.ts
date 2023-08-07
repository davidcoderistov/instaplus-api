import { ObjectType } from 'type-graphql'
import { CursorPaginatedResponseFactory } from '../../../shared/graphql/cursor-paginated-response-factory'
import { PostDetails } from './post-details.model'


@ObjectType()
export class FollowedUsersPosts extends CursorPaginatedResponseFactory<PostDetails>(PostDetails) {
}