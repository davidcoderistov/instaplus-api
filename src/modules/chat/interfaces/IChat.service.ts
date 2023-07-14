import {
    FindChatsDto,
    FindMessagesByChatIdDto,
    CreateChatDto,
    AddChatMembersDto,
} from '../dtos'
import { IChat } from '../db.models/chat.model'
import { ChatsWithLatestMessage, Messages } from '../graphql.models'


export interface IChatService {
    findChatsForUser(userId: string, findChatsDto: FindChatsDto): Promise<ChatsWithLatestMessage>

    findMessagesByChatId(userId: string, findMessagesByChatIdDto: FindMessagesByChatIdDto): Promise<Messages>

    createChat(createChatDto: CreateChatDto, creatorId: string): Promise<IChat>

    deleteChat(chatId: string, userId: string): Promise<IChat>

    addChatMembers(addChatMembersDto: AddChatMembersDto): Promise<IChat>

    leaveChat(chatId: string, userId: string): Promise<IChat | null>
}