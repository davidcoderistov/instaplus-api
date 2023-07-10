import { FindChatsDto, FindMessagesByChatIdDto } from '../dtos'
import { ChatsModel, MessagesModel } from '../graphql.models'


export interface IChatRepository {
    findChatsForUser(userId: string, findChatsDto: FindChatsDto): Promise<ChatsModel>

    findMessagesByChatId(findMessagesByChatIdDto: FindMessagesByChatIdDto): Promise<MessagesModel>
}