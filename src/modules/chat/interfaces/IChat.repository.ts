import { FindChatsDto, FindMessagesByChatIdDto, DeleteChatDto } from '../dtos'
import { IChat } from '../db.models/chat.model'
import { IUser } from '../../user/user.model'
import { ChatsWithLatestMessage, Messages } from '../graphql.models'


export interface IChatRepository {
    findChatById(chatId: string): Promise<IChat | null>

    findChatsForUser(userId: string, findChatsDto: FindChatsDto): Promise<ChatsWithLatestMessage>

    findMessagesByChatId(findMessagesByChatIdDto: FindMessagesByChatIdDto): Promise<Messages>

    findChatByChatMemberIds(chatMemberIds: string[]): Promise<IChat | null>

    createChat(creator: Pick<IUser, '_id' | 'firstName' | 'lastName' | 'username' | 'photoUrl'>, chatMembers: Pick<IUser, '_id' | 'firstName' | 'lastName' | 'username' | 'photoUrl'>[]): Promise<IChat>

    upsertUserDeletedChat(deleteChatDto: DeleteChatDto): Promise<void>
}