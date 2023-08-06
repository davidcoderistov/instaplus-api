import { injectable } from 'inversify'
import { IPostRepository } from './interfaces/IPost.repository'
import PostModel, { IPost } from './db.models/post.model'
import HashtagModel, { IHashtag } from './db.models/hashtag.model'
import HashtagPostModel, { IHashtagPost } from './db.models/hashtag-post.model'
import { IUser } from '../user/db.models/user.model'
import PostLikeModel, { IPostLike } from './db.models/post-like.model'
import PostSaveModel, { IPostSave } from './db.models/post-save.model'
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
        return post.toObject()
    }

    public async createHashtag(name: string, postId: string): Promise<IHashtag> {
        const hashtag = new HashtagModel({
            name,
            postIds: [postId],
        })
        await hashtag.save()
        return hashtag.toObject()
    }

    public async createHashtagPost(hashtagId: string, postId: string): Promise<IHashtagPost> {
        const hashtagPost = new HashtagPostModel({
            hashtagId,
            postId,
        })
        await hashtagPost.save()
        return hashtagPost.toObject()
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

    public async findPostById(postId: string): Promise<IPost | null> {
        const post = await PostModel.findById(postId)
        return post ? post.toObject() : null
    }

    public async findPostLike(postId: string, userId: string): Promise<IPostLike | null> {
        const postLikes: IPostLike[] = await PostLikeModel.find({ postId, userId }).lean()
        return postLikes.length > 0 ? postLikes[0].toObject() : null
    }

    public async createPostLike(postId: string, userId: string): Promise<IPostLike> {
        const postLike = new PostLikeModel({
            postId,
            userId,
        })
        await postLike.save()
        return postLike.toObject()
    }

    public async deletePostLike(postId: string, userId: string): Promise<IPostLike | null> {
        return PostLikeModel.findOneAndDelete({ postId, userId }).lean()
    }

    public async findPostSave(postId: string, userId: string): Promise<IPostSave | null> {
        const postSaves: IPostSave[] = await PostSaveModel.find({ postId, userId }).lean()
        return postSaves.length > 0 ? postSaves[0].toObject() : null
    }

    public async createPostSave(postId: string, userId: string): Promise<IPostSave> {
        const postSave = new PostSaveModel({
            postId,
            userId,
        })
        await postSave.save()
        return postSave.toObject()
    }
}