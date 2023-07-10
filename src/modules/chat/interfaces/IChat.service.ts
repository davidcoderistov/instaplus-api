import { FindChatsDto, FindMessagesByChatIdDto, CreateChatDto } from '../dtos'
import { IChat } from '../db.models/chat.model'
import { ChatsModel, MessagesModel } from '../graphql.models'


export interface IChatService {
    findChatsForUser(userId: string, findChatsDto: FindChatsDto): Promise<ChatsModel>

    findMessagesByChatId(findMessagesByChatIdDto: FindMessagesByChatIdDto): Promise<MessagesModel>

    createChat(createChatDto: CreateChatDto, creatorId: string): Promise<IChat>
}