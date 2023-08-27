import { ObjectType } from 'type-graphql'
import { CursorPaginatedResponseFactory } from '../../../shared/graphql/cursor-paginated-response-factory'
import { Post } from './post.model'


@ObjectType()
export class SavedPostsForUser extends CursorPaginatedResponseFactory<Post>(Post) {
}