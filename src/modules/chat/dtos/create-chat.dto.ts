import { ArgsType, Field } from 'type-graphql'
import { MinLength } from 'class-validator'


@ArgsType()
export class CreateChatDto {

    @Field(() => [String])
    @MinLength(2)
    chatMemberIds!: string[]
}