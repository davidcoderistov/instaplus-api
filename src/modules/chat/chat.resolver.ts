import { inject, injectable } from 'inversify'
import { Resolver, Query, Args, Ctx } from 'type-graphql'
import { TYPES } from '../../container/types'
import { IChatService } from './interfaces/IChat.service'
import { Context } from '../../shared/types'
import { FindChatsDto } from './dtos/find-chats.dto'
import { ChatsModel } from './graphql.models/chats.model'


@injectable()
@Resolver()
export class ChatResolver {

    constructor(
        @inject(TYPES.IChatService) private readonly _chatService: IChatService) {
    }

    @Query(() => ChatsModel)
    public async findChatsForUser(@Args() findChatsDto: FindChatsDto, @Ctx() { userId }: Context): Promise<ChatsModel> {
        return this._chatService.findChatsForUser(userId, findChatsDto)
    }
}