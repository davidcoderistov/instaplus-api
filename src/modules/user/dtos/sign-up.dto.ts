import { ArgsType, Field } from 'type-graphql'
import { MinLength } from 'class-validator'


@ArgsType()
export class SignUpDto {

    @Field()
    firstName!: string

    @Field()
    lastName!: string

    @Field()
    username!: string

    @Field()
    @MinLength(8)
    password!: string
}