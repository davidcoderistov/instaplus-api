import { inject, injectable } from 'inversify'
import { IChatService } from './interfaces/IChat.service'
import {
    FindChatsDto,
    FindMessagesByChatIdDto,
    CreateChatDto,
    AddChatMembersDto,
    CreateMessageDto,
    ReactToMessageDto,
} from './dtos'
import { ChatsWithLatestMessage, ChatWithLatestMessage, Messages } from './graphql.models'
import { IChat } from './db.models/chat.model'
import { TYPES } from '../../container/types'
import { IChatRepository } from './interfaces/IChat.repository'
import { IUserRepository } from '../user/interfaces/IUser.repository'
import { IFileRepository } from '../file/IFile.repository'
import { CustomValidationException } from '../../shared/exceptions'


@injectable()
export class ChatService implements IChatService {

    constructor(
        @inject(TYPES.IChatRepository) private readonly _chatRepository: IChatRepository,
        @inject(TYPES.IUserRepository) private readonly _userRepository: IUserRepository,
        @inject(TYPES.IFileRepository) private readonly _fileRepository: IFileRepository) {
    }

    public async findChatsForUser(userId: string, findChatsDto: FindChatsDto): Promise<ChatsWithLatestMessage> {
        return this._chatRepository.findChatsForUser(userId, findChatsDto)
    }

    public async findMessagesByChatId(userId: string, findMessagesByChatIdDto: FindMessagesByChatIdDto): Promise<Messages> {
        return this._chatRepository.findMessagesByChatId(userId, findMessagesByChatIdDto)
    }

    public async createChat(createChatDto: CreateChatDto, creatorId: string): Promise<ChatWithLatestMessage> {
        try {
            if (createChatDto.chatMemberIds.length <= 2) {
                const chat = await this._chatRepository.findChatForUser(creatorId, createChatDto.chatMemberIds)

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

            const chat = await this._chatRepository.createChat(
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
            return {
                chat,
            }
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

    public async createMessage(createMessageDto: CreateMessageDto, creatorId: string): Promise<ChatWithLatestMessage> {
        const {
            chatId,
            text,
            photo,
            replyId,
        } = createMessageDto

        const chat = await this._chatRepository.findChatById(chatId)
        if (!chat) {
            return Promise.reject(new CustomValidationException('chatId', `Chat ${chatId} does not exist`))
        }

        const user = await this._userRepository.findUserById(creatorId)
        if (!user) {
            return Promise.reject(new CustomValidationException('userId', `User ${creatorId} does not exist`))
        }

        let reply = null
        if (replyId) {
            const message = await this._chatRepository.findMessageById(replyId)
            if (!message) {
                return Promise.reject(new CustomValidationException('replyId', `Message ${replyId} does not exist`))
            }
            reply = {
                _id: message._id,
                creator: message.creator,
                text: message.text,
                photoUrl: message.photoUrl,
                photoOrientation: message.photoOrientation,
            }
        }

        let photoUrl, photoOrientation = null
        if (photo) {
            const upload = await this._fileRepository.storeUpload(photo, `/instaplus/storage/chat/${chatId}`)
            photoUrl = upload.photoUrl
            photoOrientation = upload.photoOrientation
        }

        const message = await this._chatRepository.createMessage(
            chatId,
            { _id: user._id, username: user.username, photoUrl: user.photoUrl },
            text,
            photoUrl,
            photoOrientation,
            reply,
        )
        return {
            chat,
            message,
        } as unknown as ChatWithLatestMessage
    }

    public async reactToMessage(reactToMessageDto: ReactToMessageDto, creatorId: string): Promise<ChatWithLatestMessage> {
        try {
            const creator = await this._userRepository.findUserById(creatorId)
            if (!creator) {
                return Promise.reject(new CustomValidationException('userId', `User ${creatorId} does not exist`))
            }

            let message = await this._chatRepository.findMessageByReactionAndUpdate(reactToMessageDto.messageId, creatorId, reactToMessageDto.reaction)

            if (!message) {
                message = await this._chatRepository.addMessageReaction(
                    reactToMessageDto.messageId,
                    {
                        _id: creator._id,
                        firstName: creator.firstName,
                        lastName: creator.lastName,
                        username: creator.username,
                        photoUrl: creator.photoUrl,
                    },
                    reactToMessageDto.reaction,
                )
            }

            if (message) {
                const chat = await this._chatRepository.findChatById(message.chatId)
                if (!chat) {
                    return Promise.reject(new CustomValidationException('chatId', `Chat ${message.chatId} does not exist`))
                }

                return {
                    chat,
                    message,
                } as unknown as ChatWithLatestMessage
            } else {
                return Promise.reject(new CustomValidationException('messageId', `Message ${reactToMessageDto.messageId} does not exist`))
            }
        } catch (err) {
            throw err
        }
    }
}