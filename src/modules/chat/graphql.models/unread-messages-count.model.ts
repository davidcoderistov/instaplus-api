import { ObjectType, Field, Int } from 'type-graphql'


@ObjectType()
export class UnreadMessagesCount {

    @Field(() => [String])
    chatsIds!: string[]

    @Field(() => Int)
    count!: number

}