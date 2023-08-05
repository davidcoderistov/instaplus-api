import { inject, injectable } from 'inversify'
import {
    Arg,
    Query,
    Resolver,
} from 'type-graphql'
import { IPostService } from './interfaces/IPost.service'
import { TYPES } from '../../container/types'
import { Hashtag } from './graphql.models'


@injectable()
@Resolver()
export class PostResolver {

    constructor(
        @inject(TYPES.IPostService) private readonly _postService: IPostService) {
    }

    @Query(() => [Hashtag])
    public async findHashtagsBySearchQuery(@Arg('searchQuery') searchQuery: string): Promise<Hashtag[]> {
        return await this._postService.findHashtagsBySearchQuery(searchQuery, 15) as unknown as Hashtag[]
    }
}