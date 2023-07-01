import { inject, injectable } from 'inversify'
import { IChatService } from './interfaces/IChat.service'
import { FindChatsDto } from './dtos/find-chats.dto'
import { ChatsModel } from './graphql.models/chats.model'
import { TYPES } from '../../container/types'
import { IChatRepository } from './interfaces/IChat.repository'


@injectable()
export class ChatService implements IChatService {

    constructor(
        @inject(TYPES.IChatRepository) private readonly _chatRepository: IChatRepository) {
    }

    public async findChatsForUser(userId: string, findChatsDto: FindChatsDto): Promise<ChatsModel> {
        return this._chatRepository.findChatsForUser(userId, findChatsDto)
    }
}