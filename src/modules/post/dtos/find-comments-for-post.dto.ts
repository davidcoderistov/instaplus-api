import { ArgsType, Field } from 'type-graphql'
import { OffsetPaginationArgs } from '../../../shared/graphql/offset-pagination-args'


@ArgsType()
export class FindCommentsForPostDto extends OffsetPaginationArgs {

    @Field(() => String)
    postId!: string
}