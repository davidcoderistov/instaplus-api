import { ObjectType, Field } from 'type-graphql'
import { UserModel } from './user.model'


@ObjectType()
export class AuthUserModel {

    @Field(() => UserModel)
    user!: UserModel

    @Field(() => String, { nullable: true })
    accessToken?: string | null
}