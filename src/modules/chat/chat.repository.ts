import { injectable } from 'inversify'
import { IChatRepository } from './interfaces/IChat.repository'
import { FindChatsDto, FindMessagesByChatIdDto } from './dtos'
import { IChat } from './db.models/chat.model'
import { IUser } from '../user/user.model'
import { IUserDeletedChat } from './db.models/user-deleted-chat.model'
import { ChatsWithLatestMessage, ChatWithLatestMessage, Chat, Messages, Message } from './graphql.models'
import mongoose, { Types } from 'mongoose'
import ChatModel from './db.models/chat.model'
import MessageModel from './db.models/message.model'
import UserDeletedChatModel from './db.models/user-deleted-chat.model'
import { getCursorPaginatedData } from '../../shared/utils/misc'


@injectable()
export class ChatRepository implements IChatRepository {

    public async findChatById(chatId: string): Promise<IChat | null> {
        try {
            const chat = await ChatModel.findById(chatId)
            return chat ? chat.toObject() : null
        } catch (err) {
            throw err
        }
    }

    public async findChatsForUser(userId: string, {
        cursor,
        limit,
    }: FindChatsDto): Promise<ChatsWithLatestMessage> {
        const chats = await ChatModel.aggregate([
            {
                $match: {
                    'chatMembers._id': new mongoose.Types.ObjectId(userId),
                },
            },
            {
                $addFields: {
                    chatId: { $toString: '$_id' },
                },
            },
            {
                $lookup: {
                    from: UserDeletedChatModel.collection.name,
                    let: {
                        chatId: '$chatId',
                        userId: userId,
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$userId', '$$userId'] },
                                        { $eq: ['$chatId', '$$chatId'] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: 'userDeletedChat',
                },
            },
            {
                $unwind: {
                    path: '$userDeletedChat',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: MessageModel.collection.name,
                    localField: 'chatId',
                    foreignField: 'chatId',
                    as: 'messages',
                },
            },
            {
                $unwind: {
                    path: '$messages',
                    preserveNullAndEmptyArrays: false,
                },
            },
            {
                $match: {
                    $expr: {
                        $cond: [
                            {
                                $eq: ['$userDeletedChat', null],
                            },
                            true,
                            {
                                $gt: ['$messages.createdAt', '$userDeletedChat.updatedAt'],
                            },
                        ],
                    },
                },
            },
            {
                $sort: { 'messages.createdAt': -1, 'messages._id': -1 },
            },
            {
                $group: {
                    _id: '$_id',
                    creator: { $first: '$creator' },
                    chatMembers: { $first: '$chatMembers' },
                    createdAt: { $first: '$createdAt' },
                    message: { $first: '$messages' },
                },
            },
            {
                $project: {
                    chat: {
                        _id: '$_id',
                        creator: '$creator',
                        chatMembers: '$chatMembers',
                        createdAt: '$createdAt',
                    },
                    message: {
                        _id: '$message._id',
                        creator: '$message.creator',
                        text: '$message.text',
                        photoUrl: '$message.photoUrl',
                        videoUrl: '$message.videoUrl',
                        createdAt: '$message.createdAt',
                    },
                },
            },
            {
                $sort: { 'message.createdAt': -1, 'message._id': -1 },
            },
            ...(cursor ? [
                {
                    $match: {
                        $or: [
                            { 'message.createdAt': { $lt: cursor.createdAt } },
                            {
                                $and: [
                                    { 'message.createdAt': cursor.createdAt },
                                    {
                                        $or: [
                                            { 'message._id': { $lt: new mongoose.Types.ObjectId(cursor._id) } },
                                            { 'message._id': new mongoose.Types.ObjectId(cursor._id) },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                },
            ] : []),
            {
                $facet: {
                    data: [
                        { $limit: limit },
                    ],
                    nextCursor: [
                        { $skip: limit },
                        {
                            $limit: 1,
                        },
                        {
                            $project: {
                                _id: '$message._id',
                                createdAt: '$message.createdAt',
                            },
                        },
                    ],
                },
            },
        ])
        return getCursorPaginatedData(chats) as unknown as ChatsWithLatestMessage
    }

    public async findMessagesByChatId(userId: string, {
        chatId,
        cursor,
        limit,
    }: FindMessagesByChatIdDto): Promise<Messages> {
        const messages = await MessageModel.aggregate([
            {
                $match: { chatId },
            },
            {
                $lookup: {
                    from: UserDeletedChatModel.collection.name,
                    let: {
                        chatId: chatId,
                        userId: userId,
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$userId', '$$userId'] },
                                        { $eq: ['$chatId', '$$chatId'] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: 'userDeletedChat',
                },
            },
            {
                $unwind: {
                    path: '$userDeletedChat',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $match: {
                    $expr: {
                        $cond: [
                            {
                                $eq: ['$userDeletedChat', null],
                            },
                            true,
                            {
                                $gt: ['$createdAt', '$userDeletedChat.updatedAt'],
                            },
                        ],
                    },
                },
            },
            {
                $sort: { createdAt: -1, _id: -1 },
            },
            ...(cursor ? [
                {
                    $match: {
                        $or: [
                            { createdAt: { $lt: cursor.createdAt } },
                            {
                                $and: [
                                    { createdAt: cursor.createdAt },
                                    {
                                        $or: [
                                            { _id: { $lt: new mongoose.Types.ObjectId(cursor._id) } },
                                            { _id: new mongoose.Types.ObjectId(cursor._id) },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                },
            ] : []),
            {
                $facet: {
                    data: [
                        { $limit: limit },
                    ],
                    nextCursor: [
                        { $skip: limit },
                        {
                            $limit: 1,
                        },
                        {
                            $project: {
                                _id: 1,
                                createdAt: 1,
                            },
                        },
                    ],
                },
            },
        ])
        return getCursorPaginatedData(messages) as unknown as Messages
    }

    public async findChatByChatMemberIds(chatMemberIds: string[]): Promise<Chat | null> {
        const chats: Chat[] = await ChatModel.find({
            $and: [
                {
                    'chatMembers._id': {
                        $all: chatMemberIds.map(id => new Types.ObjectId(id)),
                    },
                },
                {
                    chatMembers: {
                        $size: chatMemberIds.length,
                    },
                },
            ],
        }).lean()
        return chats.length > 0 ? chats[0] : null
    }

    public async findChatForUser(userId: string, chatMemberIds: string[]): Promise<ChatWithLatestMessage | null> {
        const chat = await this.findChatByChatMemberIds(chatMemberIds)
        if (chat) {
            const chatId = chat._id.toString()
            const userDeletedChat = await this.findUserDeletedChat(userId, chatId)
            const messages = await MessageModel.aggregate([
                {
                    $match: {
                        chatId: chatId,
                    },
                },
                ...(userDeletedChat ? [
                    {
                        $match: {
                            createdAt: { $gt: userDeletedChat.updatedAt },
                        },
                    },
                ] : []),
                {
                    $sort: {
                        createdAt: -1,
                    },
                },
                {
                    $limit: 1,
                },
            ])
            const message = messages[0] ? messages[0] as unknown as Message : null
            return {
                chat,
                ...message && { message },
            }
        }
        return null
    }

    public async findUserDeletedChat(userId: string, chatId: string): Promise<IUserDeletedChat | null> {
        const userDeletedChat = await UserDeletedChatModel.findOne({ userId, chatId })
        return userDeletedChat ? userDeletedChat.toObject() : null
    }

    public async createChat(creator: Pick<IUser, '_id' | 'firstName' | 'lastName' | 'username' | 'photoUrl'>, chatMembers: Pick<IUser, '_id' | 'firstName' | 'lastName' | 'username' | 'photoUrl'>[]): Promise<Chat> {
        const chat = new ChatModel({
            creator,
            chatMembers,
        })
        return await chat.save() as unknown as Chat
    }

    public async upsertUserDeletedChat(chatId: string, userId: string): Promise<IUserDeletedChat> {
        return UserDeletedChatModel.findOneAndUpdate({
            userId: userId,
            chatId: chatId,
        }, { $currentDate: { updatedAt: true } }, { upsert: true, new: true, lean: true })
    }

    public async addChatMembers(chatId: string, chatMembers: Pick<IUser, '_id' | 'firstName' | 'lastName' | 'username' | 'photoUrl'>[]): Promise<IChat | null> {
        return ChatModel.findOneAndUpdate(
            { _id: chatId },
            { $push: { chatMembers: { $each: chatMembers } } },
            { new: true, lean: true },
        )
    }

    public async leaveChat(chatId: string, userId: string): Promise<IChat | null> {
        return ChatModel.findOneAndUpdate(
            { _id: chatId },
            { $pull: { chatMembers: { _id: new mongoose.Types.ObjectId(userId) } } },
            { new: true, lean: true },
        )
    }
}