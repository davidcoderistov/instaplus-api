import { IChat } from '../models/chat.model'
import { IMessage } from '../models/message.model'


export interface IChatWithLatestMessage extends IChat {
    message: Pick<IMessage, '_id' | 'creator' | 'text' | 'photoUrl' | 'videoUrl' | 'createdAt'>
}

export interface IChatRepository {
    findChatsWithLatestMessagesForUser(userId: string, offset: number, limit: number): Promise<IChatWithLatestMessage[]>
}