import { ArgsType, Field } from 'type-graphql'
import { CursorPaginationArgs } from '../../../shared/graphql/cursor-pagination-args'


@ArgsType()
export class FindMessagesByChatIdDto extends CursorPaginationArgs {

    @Field()
    chatId!: string
}