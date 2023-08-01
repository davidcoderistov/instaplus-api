import { ArgsType, Field } from 'type-graphql'


@ArgsType()
export class UnmarkUserSearchDto {

    @Field(() => String, { nullable: true })
    searchedUserId?: string | null

    @Field(() => String, { nullable: true })
    searchedHashtagId?: string | null
}