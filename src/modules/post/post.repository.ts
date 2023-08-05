import { injectable } from 'inversify'
import { IPostRepository } from './interfaces/IPost.repository'
import PostModel, { IPost } from './db.models/post.model'
import HashtagModel, { IHashtag } from './db.models/hashtag.model'
import { IUser } from '../user/db.models/user.model'
import { CreatePostDto } from './dtos'
import { Types } from 'mongoose'


@injectable()
export class PostRepository implements IPostRepository {

    public async createPost(
        createPostDto: Pick<CreatePostDto, 'caption' | 'location'>,
        photoUrls: string[],
        creator: Pick<IUser, '_id' | 'firstName' | 'lastName' | 'username' | 'photoUrl'>): Promise<IPost> {
        const { caption = null, location = null } = createPostDto
        const post = new PostModel({
            caption,
            location,
            photoUrls,
            creator,
        })
        await post.save()
        return post.toObject() as unknown as IPost
    }

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

    public async findHashtagsByNames(names: string[]): Promise<IHashtag[]> {
        return HashtagModel
            .find({ name: { $in: names } })
            .lean()
    }
}