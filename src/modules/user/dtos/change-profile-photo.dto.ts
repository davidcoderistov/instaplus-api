import { ArgsType, Field } from 'type-graphql'
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts'


@ArgsType()
export class ChangeProfilePhotoDto {

    @Field(() => GraphQLUpload)
    photo!: Promise<FileUpload>
}