import { ArgsType } from 'type-graphql'
import { OffsetPaginationArgs } from '../../../shared/graphql/offset-pagination-args'


@ArgsType()
export class FindSuggestedPostsDto extends OffsetPaginationArgs {
}