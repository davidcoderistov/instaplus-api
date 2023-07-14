import { inject, injectable } from 'inversify'
import { Args, Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql'
import { TYPES } from '../../container/types'
import { IChatService } from './interfaces/IChat.service'
import { Context } from '../../shared/types'
import { CreateChatDto, FindChatsDto, FindMessagesByChatIdDto } from './dtos'
import { Chat, ChatsWithLatestMessage, Messages } from './graphql.models'


@injectable()
@Resolver()
export class ChatResolver {

    constructor(
        @inject(TYPES.IChatService) private readonly _chatService: IChatService) {
    }

    @Query(() => ChatsWithLatestMessage)
    public async findChatsForUser(@Args() findChatsDto: FindChatsDto, @Ctx() { userId }: Context): Promise<ChatsWithLatestMessage> {
        return this._chatService.findChatsForUser(userId, findChatsDto)
    }

    @Query(() => Messages)
    public async findMessagesByChatId(@Args() findMessagesByChatIdDto: FindMessagesByChatIdDto, @Ctx() { userId }: Context): Promise<Messages> {
        return this._chatService.findMessagesByChatId(userId, findMessagesByChatIdDto)
    }

    @Mutation(() => Chat)
    public async createChat(@Args() createChatDto: CreateChatDto, @Ctx() { userId }: Context): Promise<Chat> {
        return await this._chatService.createChat(createChatDto, userId) as unknown as Chat
    }

    @Mutation(() => Chat)
    public async deleteChat(@Arg('chatId') chatId: string, @Ctx() { userId }: Context): Promise<Chat> {
        return await this._chatService.deleteChat(chatId, userId) as unknown as Chat
    }

    @Mutation(() => Chat)
    public async leaveChat(@Arg('chatId') chatId: string, @Ctx() { userId }: Context): Promise<Chat> {
        return await this._chatService.leaveChat(chatId, userId) as unknown as Chat
    }
}