import { inject, injectable } from 'inversify'
import { IChatService } from './interfaces/IChat.service'
import {
    FindChatsDto,
    FindMessagesByChatIdDto,
    CreateChatDto,
    AddChatMembersDto,
} from './dtos'
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
        return this._chatRepository.findMessagesByChatId(userId, findMessagesByChatIdDto)
    }

    public async createChat(createChatDto: CreateChatDto, creatorId: string): Promise<IChat> {
        try {
            if (createChatDto.chatMemberIds.length <= 2) {
                const chat = await this._chatRepository.findChatByChatMemberIds(createChatDto.chatMemberIds)

                if (chat) {
                    return chat
                }
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

    public async deleteChat(chatId: string, userId: string): Promise<IChat> {
        try {
            const user = await this._userRepository.findUserById(userId)
            if (!user) {
                return Promise.reject(new CustomValidationException('userId', `User ${userId} does not exist`))
            }

            const chat = await this._chatRepository.findChatById(chatId)
            if (!chat) {
                return Promise.reject(new CustomValidationException('chatId', `Chat ${chatId} does not exist`))
            }

            await this._chatRepository.upsertUserDeletedChat(chatId, userId)
            return await this._chatRepository.findChatById(chatId) as IChat
        } catch (err) {
            throw err
        }
    }

    public async addChatMembers(addChatMembersDto: AddChatMembersDto): Promise<IChat> {
        try {
            const chatMembers = await this._userRepository.findUsersByIds(addChatMembersDto.chatMemberIds)
            if (chatMembers.length !== addChatMembersDto.chatMemberIds.length) {
                return Promise.reject(new CustomValidationException('chatMembers', `Chat members should all exist`))
            }

            const chat = await this._chatRepository.addChatMembers(
                addChatMembersDto.chatId,
                chatMembers.map(chatMember => ({
                    _id: chatMember._id,
                    firstName: chatMember.firstName,
                    lastName: chatMember.lastName,
                    username: chatMember.username,
                    photoUrl: chatMember.photoUrl,
                })),
            )

            if (chat) {
                return chat
            } else {
                return Promise.reject(new CustomValidationException('chatId', `Chat ${addChatMembersDto.chatId} does not exist`))
            }
        } catch (err) {
            throw err
        }
    }

    public async leaveChat(chatId: string, userId: string): Promise<IChat | null> {
        try {
            const chat = await this._chatRepository.leaveChat(chatId, userId)
            if (chat) {
                return chat
            } else {
                return Promise.reject(new CustomValidationException('chatId', `Chat ${chatId} does not exist`))
            }
        } catch (err) {
            throw err
        }
    }
}