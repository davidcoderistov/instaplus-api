import { ObjectType, Field } from 'type-graphql'
import { SearchUser } from '../../user/graphql.models'
import { Hashtag } from '../../post/graphql.models'


@ObjectType()
export class UserSearch {

    @Field(() => SearchUser, { nullable: true })
    searchUser?: SearchUser | null

    @Field(() => Hashtag, { nullable: true })
    hashtag?: Hashtag | null
}