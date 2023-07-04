import { ArgsType, Field } from 'type-graphql'


@ArgsType()
export class RefreshDto {

    @Field(() => String)
    refreshToken?: string | null
}