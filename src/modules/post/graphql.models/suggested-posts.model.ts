import { ObjectType } from 'type-graphql'
import { OffsetPaginatedResponseFactory } from '../../../shared/graphql/offset-paginated-response-factory'
import { Post } from './post.model'


@ObjectType()
export class SuggestedPosts extends OffsetPaginatedResponseFactory<Post>(Post) {
}