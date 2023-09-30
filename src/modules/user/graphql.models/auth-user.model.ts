import { ObjectType, Field } from 'type-graphql'
import { User } from './user.model'


@ObjectType()
export class AuthUser {

    @Field(() => User)
    user!: User

    @Field(() => String, { nullable: true })
    accessToken?: string | null

    @Field(() => String, { nullable: true })
    refreshToken?: string | null

    @Field()
    createdAt!: Date
}