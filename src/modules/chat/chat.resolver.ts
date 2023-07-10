import { inject, injectable } from 'inversify'
import { Args, Ctx, Mutation, Query, Resolver } from 'type-graphql'
import { TYPES } from '../../container/types'
import { IChatService } from './interfaces/IChat.service'
import { Context } from '../../shared/types'
import { CreateChatDto, FindChatsDto, FindMessagesByChatIdDto } from './dtos'
import { ChatModel, ChatsWithLatestMessageModel, MessagesModel } from './graphql.models'


@injectable()
@Resolver()
export class ChatResolver {

    constructor(
        @inject(TYPES.IChatService) private readonly _chatService: IChatService) {
    }

    @Query(() => ChatsWithLatestMessageModel)
    public async findChatsForUser(@Args() findChatsDto: FindChatsDto, @Ctx() { userId }: Context): Promise<ChatsWithLatestMessageModel> {
        return this._chatService.findChatsForUser(userId, findChatsDto)
    }

    @Query(() => MessagesModel)
    public async findMessagesByChatId(@Args() findMessagesByChatIdDto: FindMessagesByChatIdDto): Promise<MessagesModel> {
        return this._chatService.findMessagesByChatId(findMessagesByChatIdDto)
    }

    @Mutation(() => ChatModel)
    public async createChat(@Args() createChatDto: CreateChatDto, @Ctx() { userId }: Context): Promise<ChatModel> {
        return await this._chatService.createChat(createChatDto, userId) as unknown as ChatModel
    }
}