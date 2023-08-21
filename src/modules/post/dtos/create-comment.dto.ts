import { ArgsType, Field } from 'type-graphql'


@ArgsType()
export class CreateCommentDto {

    @Field(() => String)
    text!: string

    @Field(() => String)
    postId!: string

    @Field(() => String, { nullable: true })
    replyCommentId?: string | null
}