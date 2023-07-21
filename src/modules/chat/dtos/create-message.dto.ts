import { ArgsType, Field } from 'type-graphql'
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts'


@ArgsType()
export class CreateMessageDto {

    @Field()
    chatId!: string

    @Field({ nullable: true })
    text?: string

    @Field(() => GraphQLUpload, { nullable: true })
    photo?: Promise<FileUpload>

    @Field({ nullable: true })
    replyId?: string
}