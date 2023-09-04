import { ArgsType, Field } from 'type-graphql'


@ArgsType()
export class UpdateUserDto {

    @Field()
    firstName!: string

    @Field()
    lastName!: string

    @Field()
    username!: string
}