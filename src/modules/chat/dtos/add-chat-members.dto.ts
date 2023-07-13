import { ArgsType, Field } from 'type-graphql'
import { ArrayMinSize, ArrayUnique } from 'class-validator'


@ArgsType()
export class AddChatMembersDto {

    @Field()
    chatId!: string

    @Field(() => [String])
    @ArrayUnique()
    @ArrayMinSize(1)
    chatMemberIds!: string[]
}