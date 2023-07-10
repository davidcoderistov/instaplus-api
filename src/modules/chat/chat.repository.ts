import { injectable } from 'inversify'
import { IChatRepository } from './interfaces/IChat.repository'
import { FindChatsDto, FindMessagesByChatIdDto } from './dtos'
import { ChatsModel, MessagesModel } from './graphql.models'
import mongoose from 'mongoose'
import ChatModel from './db.models/chat.model'
import MessageModel from './db.models/message.model'
import { getPaginatedData } from '../../shared/utils/misc'


@injectable()
export class ChatRepository implements IChatRepository {

    public async findChatsForUser(userId: string, findChatsDto: FindChatsDto): Promise<ChatsModel> {
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
                    _id: 1,
                    creator: 1,
                    chatMembers: 1,
                    createdAt: 1,
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
        return getPaginatedData(chats) as unknown as ChatsModel
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
}