import { ArgsType, Field } from 'type-graphql'


@ArgsType()
export class ReactToMessageDto {

    @Field()
    messageId!: string

    @Field()
    reaction!: string
}