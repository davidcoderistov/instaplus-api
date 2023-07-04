import { ArgsType, Field } from 'type-graphql'


@ArgsType()
export class RefreshDto {

    @Field()
    refreshToken!: string
}