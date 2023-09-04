import { FindChatsDto, FindMessagesByChatIdDto } from '../dtos'
import { IChat } from '../db.models/chat.model'
import { IMessage } from '../db.models/message.model'
import { IUser } from '../../user/db.models/user.model'
import { IUserDeletedChat } from '../db.models/user-deleted-chat.model'
import { ChatsWithLatestMessage, ChatWithLatestMessage, Chat, Messages } from '../graphql.models'


export interface IChatRepository {
    findChatById(chatId: string): Promise<IChat | null>

    findChatsForUser(userId: string, findChatsDto: FindChatsDto): Promise<ChatsWithLatestMessage>

    findMessagesByChatId(userId: string, findMessagesByChatIdDto: FindMessagesByChatIdDto): Promise<Messages>

    findChatByChatMemberIds(chatMemberIds: string[]): Promise<Chat | null>

    findChatForUser(userId: string, chatMemberIds: string[]): Promise<ChatWithLatestMessage | null>

    findUserDeletedChat(userId: string, chatId: string): Promise<IUserDeletedChat | null>

    createChat(creator: Pick<IUser, '_id' | 'firstName' | 'lastName' | 'username' | 'photoUrl'>, chatMembers: Pick<IUser, '_id' | 'firstName' | 'lastName' | 'username' | 'photoUrl'>[]): Promise<Chat>

    upsertUserDeletedChat(chatId: string, userId: string): Promise<IUserDeletedChat>

    addChatMembers(chatId: string, chatMembers: Pick<IUser, '_id' | 'firstName' | 'lastName' | 'username' | 'photoUrl'>[]): Promise<IChat | null>

    leaveChat(chatId: string, userId: string): Promise<IChat | null>

    findMessageById(messageId: string): Promise<IMessage | null>

    markMessageAsRead(messageId: string, userId: string): Promise<IMessage | null>

    createMessage(
        chatId: string,
        creator: Pick<IUser, '_id' | 'username' | 'photoUrl'>,
        text?: string | null,
        photoUrl?: string | null,
        photoOrientation?: 'landscape' | 'portrait' | null,
        previewPhotoUrl?: string | null,
        reply?: Pick<IMessage, '_id' | 'creator' | 'text' | 'photoUrl' | 'photoOrientation' | 'previewPhotoUrl'> | null): Promise<IMessage>

    findMessageByReactionAndUpdate(messageId: string, userId: string, reaction: string): Promise<IMessage | null>

    addMessageReaction(messageId: string, creator: Pick<IUser, '_id' | 'firstName' | 'lastName' | 'username' | 'photoUrl'>, reaction: string): Promise<IMessage | null>

    updateChatsByCreator(creator: Pick<IUser, '_id' | 'firstName' | 'lastName' | 'username' | 'photoUrl'>): Promise<void>

    updateChatsByChatMember(chatMember: Pick<IUser, '_id' | 'firstName' | 'lastName' | 'username' | 'photoUrl'>): Promise<void>

    updateMessagesByCreator(creator: Pick<IUser, '_id' | 'username' | 'photoUrl'>): Promise<void>
}