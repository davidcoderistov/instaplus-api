import { inject, injectable } from 'inversify'
import { Resolver, Query, Args, Ctx } from 'type-graphql'
import { TYPES } from '../../container/types'
import { IChatService } from './interfaces/IChat.service'
import { Context } from '../../shared/types'
import { FindChatsDto, FindMessagesByChatIdDto } from './dtos'
import { ChatsModel, MessagesModel } from './graphql.models'


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

    @Query(() => MessagesModel)
    public async findMessagesByChatId(@Args() findMessagesByChatIdDto: FindMessagesByChatIdDto): Promise<MessagesModel> {
        return this._chatService.findMessagesByChatId(findMessagesByChatIdDto)
    }
}