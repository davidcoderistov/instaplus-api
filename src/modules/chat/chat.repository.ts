import { injectable } from 'inversify'
import { IChatRepository, IChatWithLatestMessage } from './interfaces/IChat.repository'
import mongoose from 'mongoose'
import ChatModel from './models/chat.model'
import MessageModel from './models/message.model'


@injectable()
export class ChatRepository implements IChatRepository {

    public async findChatsWithLatestMessagesForUser(userId: string, offset: number, limit: number): Promise<IChatWithLatestMessage[]> {
        return ChatModel.aggregate([
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
                        $skip: offset,
                    }, {
                        $limit: limit,
                    }],
                },
            },
        ])
    }
}