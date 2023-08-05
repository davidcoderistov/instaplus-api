import { inject, injectable } from 'inversify'
import { IPostService } from './interfaces/IPost.service'
import { IPostRepository } from './interfaces/IPost.repository'
import { TYPES } from '../../container/types'
import { IHashtag } from './db.models/hashtag.model'


@injectable()
export class PostService implements IPostService {

    constructor(
        @inject(TYPES.IPostRepository) private readonly _postRepository: IPostRepository) {
    }

    public async findHashtagsBySearchQuery(searchQuery: string, limit: number): Promise<IHashtag[]> {
        return this._postRepository.findHashtagsBySearchQuery(searchQuery, limit)
    }
}