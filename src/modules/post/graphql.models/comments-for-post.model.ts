import { ObjectType } from 'type-graphql'
import { OffsetPaginatedResponseFactory } from '../../../shared/graphql/offset-paginated-response-factory'
import { Comment } from './comment.model'


@ObjectType()
export class CommentsForPost extends OffsetPaginatedResponseFactory<Comment>(Comment) {
}