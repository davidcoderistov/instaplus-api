import { ArgsType, Field } from 'type-graphql'
import { ArrayMinSize, ArrayUnique } from 'class-validator'


@ArgsType()
export class CreateChatDto {

    @Field(() => [String])
    @ArrayUnique()
    @ArrayMinSize(2)
    chatMemberIds!: string[]
}