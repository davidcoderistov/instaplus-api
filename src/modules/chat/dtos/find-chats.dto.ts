import { ArgsType } from 'type-graphql'
import { PaginationArgs } from '../../../shared/graphql/pagination-args'


@ArgsType()
export class FindChatsDto extends PaginationArgs {
}