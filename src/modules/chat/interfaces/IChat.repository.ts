import { FindChatsDto, FindMessagesByChatIdDto } from '../dtos'
import { ChatsModel } from '../graphql.models/chats.model'
import { MessagesModel } from '../graphql.models/messages.model'


export interface IChatRepository {
    findChatsForUser(userId: string, findChatsDto: FindChatsDto): Promise<ChatsModel>

    findMessagesByChatId(findMessagesByChatIdDto: FindMessagesByChatIdDto): Promise<MessagesModel>
}