import { ArgsType, Field } from 'type-graphql'


@ArgsType()
export class LeaveChatDto {
    
    @Field()
    chatId!: string

    @Field()
    userId!: string
}