import { injectable } from 'inversify'
import { IPostRepository } from './interfaces/IPost.repository'
import HashtagModel, { IHashtag } from './db.models/hashtag.model'


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
}