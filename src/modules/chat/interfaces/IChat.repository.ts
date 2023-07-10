import { FindChatsDto, FindMessagesByChatIdDto } from '../dtos'
import { IChat } from '../db.models/chat.model'
import { ChatsModel, MessagesModel } from '../graphql.models'


export interface IChatRepository {
    findChatsForUser(userId: string, findChatsDto: FindChatsDto): Promise<ChatsModel>

    findMessagesByChatId(findMessagesByChatIdDto: FindMessagesByChatIdDto): Promise<MessagesModel>

    findChatByChatMemberIds(chatMemberIds: string[]): Promise<IChat | null>
}