import { ArgsType, Field } from 'type-graphql'


@ArgsType()
export class FindUserDetailsDto {

    @Field()
    userId!: string
}