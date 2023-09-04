import { ArgsType, Field } from 'type-graphql'
import { MinLength } from 'class-validator'


@ArgsType()
export class ChangePasswordDto {

    @Field()
    @MinLength(8)
    oldPassword!: string

    @Field()
    @MinLength(8)
    newPassword!: string

    @Field()
    @MinLength(8)
    confirmNewPassword!: string
}