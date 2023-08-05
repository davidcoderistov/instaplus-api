import { ArgsType, Field } from 'type-graphql'
import { ArrayMinSize } from 'class-validator'
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts'


@ArgsType()
export class CreatePostDto {

    @Field(() => String, { nullable: true })
    caption?: string | null

    @Field(() => String, { nullable: true })
    location?: string | null

    @Field(() => [GraphQLUpload])
    @ArrayMinSize(1)
    photos!: Promise<FileUpload[]>

    @Field(() => [String], { nullable: true })
    hashtags?: string[]
}