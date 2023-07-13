import { FindChatsDto, FindMessagesByChatIdDto, CreateChatDto, DeleteChatDto, AddChatMembersDto } from '../dtos'
import { IChat } from '../db.models/chat.model'
import { ChatsWithLatestMessage, Messages } from '../graphql.models'


export interface IChatService {
    findChatsForUser(userId: string, findChatsDto: FindChatsDto): Promise<ChatsWithLatestMessage>

    findMessagesByChatId(userId: string, findMessagesByChatIdDto: FindMessagesByChatIdDto): Promise<Messages>

    createChat(createChatDto: CreateChatDto, creatorId: string): Promise<IChat>

    deleteChat(deleteChatDto: DeleteChatDto): Promise<void>

    addChatMembers(addChatMembersDto: AddChatMembersDto): Promise<IChat>
}