import { FindChatsDto, FindMessagesByChatIdDto, DeleteChatDto, LeaveChatDto } from '../dtos'
import { IChat } from '../db.models/chat.model'
import { IUser } from '../../user/user.model'
import { IUserDeletedChat } from '../db.models/user-deleted-chat.model'
import { ChatsWithLatestMessage, Messages } from '../graphql.models'


export interface IChatRepository {
    findChatById(chatId: string): Promise<IChat | null>

    findChatsForUser(userId: string, findChatsDto: FindChatsDto): Promise<ChatsWithLatestMessage>

    findMessagesByChatId(userId: string, findMessagesByChatIdDto: FindMessagesByChatIdDto): Promise<Messages>

    findChatByChatMemberIds(chatMemberIds: string[]): Promise<IChat | null>

    findUserDeletedChat(userId: string, chatId: string): Promise<IUserDeletedChat | null>

    createChat(creator: Pick<IUser, '_id' | 'firstName' | 'lastName' | 'username' | 'photoUrl'>, chatMembers: Pick<IUser, '_id' | 'firstName' | 'lastName' | 'username' | 'photoUrl'>[]): Promise<IChat>

    upsertUserDeletedChat(deleteChatDto: DeleteChatDto): Promise<void>

    addChatMembers(chatId: string, chatMembers: Pick<IUser, '_id' | 'firstName' | 'lastName' | 'username' | 'photoUrl'>[]): Promise<IChat | null>

    leaveChat(leaveChatDto: LeaveChatDto): Promise<IChat | null>
}