import { ArgsType, Field } from 'type-graphql'


@ArgsType()
export class DeleteChatDto {

    @Field()
    userId!: string

    @Field()
    chatId!: string
}