import { FindChatsDto } from '../dtos/find-chats.dto'
import { ChatsModel } from '../graphql.models/chats.model'


export interface IChatService {
    findChatsForUser(userId: string, findChatsDto: FindChatsDto): Promise<ChatsModel>
}