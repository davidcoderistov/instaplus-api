import { inject, injectable } from 'inversify'
import { IChatService } from './interfaces/IChat.service'
import { FindChatsDto, FindMessagesByChatIdDto, CreateChatDto, DeleteChatDto } from './dtos'
import { ChatsWithLatestMessage, Messages } from './graphql.models'
import { IChat } from './db.models/chat.model'
import { TYPES } from '../../container/types'
import { IChatRepository } from './interfaces/IChat.repository'
import { IUserRepository } from '../user/interfaces/IUser.repository'
import { CustomValidationException } from '../../shared/exceptions'


@injectable()
export class ChatService implements IChatService {

    constructor(
        @inject(TYPES.IChatRepository) private readonly _chatRepository: IChatRepository,
        @inject(TYPES.IUserRepository) private readonly _userRepository: IUserRepository) {
    }

    public async findChatsForUser(userId: string, findChatsDto: FindChatsDto): Promise<ChatsWithLatestMessage> {
        return this._chatRepository.findChatsForUser(userId, findChatsDto)
    }

    public async findMessagesByChatId(userId: string, findMessagesByChatIdDto: FindMessagesByChatIdDto): Promise<Messages> {
        return this._chatRepository.findMessagesByChatId(findMessagesByChatIdDto)
    }

    public async createChat(createChatDto: CreateChatDto, creatorId: string): Promise<IChat> {
        try {
            const chat = await this._chatRepository.findChatByChatMemberIds(createChatDto.chatMemberIds)

            if (chat) {
                return chat
            }

            const creator = await this._userRepository.findUserById(creatorId)
            if (!creator) {
                return Promise.reject(new CustomValidationException('creatorId', `User ${creatorId} does not exist`))
            }

            const chatMembers = await this._userRepository.findUsersByIds(createChatDto.chatMemberIds)
            if (chatMembers.length !== createChatDto.chatMemberIds.length) {
                return Promise.reject(new CustomValidationException('chatMembers', `Chat members should all exist`))
            }

            return this._chatRepository.createChat(
                {
                    _id: creator._id,
                    firstName: creator.firstName,
                    lastName: creator.lastName,
                    username: creator.username,
                    photoUrl: creator.photoUrl,
                },
                chatMembers.map(chatMember => ({
                    _id: chatMember._id,
                    firstName: chatMember.firstName,
                    lastName: chatMember.lastName,
                    username: chatMember.username,
                    photoUrl: chatMember.photoUrl,
                })),
            )
        } catch (err) {
            throw err
        }
    }

    public async deleteChat(deleteChatDto: DeleteChatDto): Promise<void> {
        try {
            const user = await this._userRepository.findUserById(deleteChatDto.userId)
            if (!user) {
                return Promise.reject(new CustomValidationException('userId', `User ${deleteChatDto.userId} does not exist`))
            }

            const chat = await this._chatRepository.findChatById(deleteChatDto.chatId)
            if (!chat) {
                return Promise.reject(new CustomValidationException('chatId', `Chat ${deleteChatDto.chatId} does not exist`))
            }

            await this._chatRepository.upsertUserDeletedChat(deleteChatDto)
        } catch (err) {
            throw err
        }
    }
}