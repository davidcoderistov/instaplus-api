import { ObjectType, Field, Int } from 'type-graphql'


@ObjectType()
export class UnreadMessagesCount {

    @Field(() => Int)
    count!: number
    
}