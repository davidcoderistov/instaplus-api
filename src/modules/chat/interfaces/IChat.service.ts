import {
    FindChatsDto,
    FindMessagesByChatIdDto,
    CreateChatDto,
    AddChatMembersDto,
    CreateMessageDto,
} from '../dtos'
import { IChat } from '../db.models/chat.model'
import { IMessage } from '../db.models/message.model'
import { ChatsWithLatestMessage, ChatWithLatestMessage, Messages } from '../graphql.models'


export interface IChatService {
    findChatsForUser(userId: string, findChatsDto: FindChatsDto): Promise<ChatsWithLatestMessage>

    findMessagesByChatId(userId: string, findMessagesByChatIdDto: FindMessagesByChatIdDto): Promise<Messages>

    createChat(createChatDto: CreateChatDto, creatorId: string): Promise<ChatWithLatestMessage>

    deleteChat(chatId: string, userId: string): Promise<IChat>

    addChatMembers(addChatMembersDto: AddChatMembersDto): Promise<IChat>

    leaveChat(chatId: string, userId: string): Promise<IChat | null>

    createMessage(createMessageDto: CreateMessageDto, creatorId: string): Promise<IMessage>
}