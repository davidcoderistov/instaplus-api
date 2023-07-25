import { inject, injectable } from 'inversify'
import {
    Args,
    Arg,
    Ctx,
    Root,
    Mutation,
    Query,
    Subscription,
    PubSub,
    PubSubEngine,
    Resolver,
    ResolverFilterData,
} from 'type-graphql'
import { TYPES } from '../../container/types'
import { IChatService } from './interfaces/IChat.service'
import { Context, WsContext } from '../../shared/types'
import {
    CreateChatDto,
    FindChatsDto,
    FindMessagesByChatIdDto,
    AddChatMembersDto,
    CreateMessageDto,
    ReactToMessageDto,
} from './dtos'
import { Chat, ChatsWithLatestMessage, ChatWithLatestMessage, Message, Messages } from './graphql.models'
import { IMessage } from './db.models/message.model'


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

    @Mutation(() => ChatWithLatestMessage)
    public async createChat(@Args() createChatDto: CreateChatDto, @Ctx() { userId }: Context): Promise<ChatWithLatestMessage> {
        return await this._chatService.createChat(createChatDto, userId) as unknown as ChatWithLatestMessage
    }

    @Mutation(() => Chat)
    public async addChatMembers(@Args() addChatMembersDto: AddChatMembersDto): Promise<Chat> {
        return await this._chatService.addChatMembers(addChatMembersDto) as unknown as Chat
    }

    @Mutation(() => Chat)
    public async deleteChat(@Arg('chatId') chatId: string, @Ctx() { userId }: Context): Promise<Chat> {
        return await this._chatService.deleteChat(chatId, userId) as unknown as Chat
    }

    @Mutation(() => Chat)
    public async leaveChat(@Arg('chatId') chatId: string, @Ctx() { userId }: Context): Promise<Chat> {
        return await this._chatService.leaveChat(chatId, userId) as unknown as Chat
    }

    @Mutation(() => Message)
    public async sendMessage(@Args() createMessageDto: CreateMessageDto, @PubSub() pubSub: PubSubEngine, @Ctx() { userId }: Context): Promise<Message> {
        const { message, chatMemberIds } = await this._chatService.createMessage(createMessageDto, userId)
        pubSub.publish('NEW_MESSAGE', {
            message,
            chatMemberIds: chatMemberIds.filter(chatMemberId => chatMemberId !== userId),
        })
        return message as unknown as Message
    }

    @Subscription(() => Message, {
        topics: 'NEW_MESSAGE',
        filter({
                   payload,
                   context,
               }: ResolverFilterData<any, { message: IMessage, chatMemberIds: string [] }, WsContext>) {
            return payload.chatMemberIds.includes(context.userId)
        },
    })
    public newMessage(@Root() payload: { message: IMessage, chatMemberIds: string[] }) {
        return payload.message as unknown as Message
    }

    @Mutation(() => Message)
    public async reactToMessage(@Args() reactToMessageDto: ReactToMessageDto, @Ctx() { userId }: Context): Promise<Message> {
        return await this._chatService.reactToMessage(reactToMessageDto, userId) as unknown as Message
    }
}