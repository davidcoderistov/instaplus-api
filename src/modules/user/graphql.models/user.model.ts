import { ObjectType, Field } from 'type-graphql'


@ObjectType()
export class UserModel {

    @Field()
    _id!: string

    @Field()
    firstName!: string

    @Field()
    lastName!: string

    @Field()
    username!: string

    @Field()
    photoUrl!: string
}