import { ArgsType, Field } from 'type-graphql'
import { PaginationArgs } from '../../../shared/graphql/pagination-args'


@ArgsType()
export class FindMessagesByChatIdDto extends PaginationArgs {

    @Field()
    chatId!: string
}