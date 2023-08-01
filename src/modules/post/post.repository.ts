import { injectable } from 'inversify'
import { IPostRepository } from './interfaces/IPost.repository'
import HashtagModel, { IHashtag } from './db.models/hashtag.model'
import { Types } from 'mongoose'


@injectable()
export class PostRepository implements IPostRepository {

    public async createHashtag(name: string, postId: string): Promise<IHashtag> {
        const hashtag = new HashtagModel({
            name,
            postIds: [postId],
        })
        await hashtag.save()
        return hashtag.toObject() as unknown as IHashtag
    }

    public async findHashtagsBySearchQuery(searchQuery: string, limit: number): Promise<IHashtag[]> {
        const regex = new RegExp(searchQuery, 'i')
        return HashtagModel
            .find({ name: { $regex: regex } })
            .sort('name')
            .limit(limit)
            .lean()
    }

    public async findHashtagById(id: string): Promise<IHashtag | null> {
        const hashtag = await HashtagModel.findById(id)
        return hashtag ? hashtag.toObject() : null
    }

    public async findHashtagsByIds(ids: string[], limit: number): Promise<IHashtag[]> {
        try {
            const hashtagIds = ids.map(id => new Types.ObjectId(id))
            return HashtagModel
                .find({ _id: { $in: hashtagIds } })
                .limit(limit)
                .lean()
        } catch (err) {
            throw err
        }
    }
}