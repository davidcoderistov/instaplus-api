import { injectable } from 'inversify'
import { IChatRepository } from './interfaces/IChat.repository'
import { FindChatsDto, FindMessagesByChatIdDto } from './dtos'
import { IChat } from './db.models/chat.model'
import { IUser } from '../user/user.model'
import { ChatsWithLatestMessageModel, MessagesModel } from './graphql.models'
import mongoose, { Types } from 'mongoose'
import ChatModel from './db.models/chat.model'
import MessageModel from './db.models/message.model'
import { getPaginatedData } from '../../shared/utils/misc'


@injectable()
export class ChatRepository implements IChatRepository {

    public async findChatsForUser(userId: string, findChatsDto: FindChatsDto): Promise<ChatsWithLatestMessageModel> {
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
                    from: MessageModel.collection.name,
                    localField: 'chatId',
                    foreignField: 'chatId',
                    as: 'messages',
                },
            },
            {
                $unwind: {
                    path: '$messages',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $sort: { 'messages.createdAt': -1 },
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
                        _id: 1,
                        creator: 1,
                        chatMembers: 1,
                        createdAt: 1,
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
                $sort: { 'message.createdAt': -1 },
            },
            {
                $facet: {
                    metadata: [{
                        $count: 'count',
                    }],
                    data: [{
                        $skip: findChatsDto.offset,
                    }, {
                        $limit: findChatsDto.limit,
                    }],
                },
            },
        ])
        return getPaginatedData(chats) as unknown as ChatsWithLatestMessageModel
    }

    public async findMessagesByChatId({ chatId, offset, limit }: FindMessagesByChatIdDto): Promise<MessagesModel> {
        const messages = await MessageModel.aggregate([
            {
                $match: { chatId },
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $facet: {
                    metadata: [{
                        $count: 'count',
                    }],
                    data: [
                        {
                            $skip: offset,
                        },
                        {
                            $limit: limit,
                        },
                    ],
                },
            },
        ])
        return getPaginatedData(messages) as unknown as MessagesModel
    }

    public async findChatByChatMemberIds(chatMemberIds: string[]): Promise<IChat | null> {
        const chats: IChat[] = await ChatModel.find({
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

    public async createChat(creator: Pick<IUser, '_id' | 'firstName' | 'lastName' | 'username' | 'photoUrl'>, chatMembers: Pick<IUser, '_id' | 'firstName' | 'lastName' | 'username' | 'photoUrl'>[]): Promise<IChat> {
        const chat = new ChatModel({
            creator,
            chatMembers,
        })
        return await chat.save() as unknown as IChat
    }
}