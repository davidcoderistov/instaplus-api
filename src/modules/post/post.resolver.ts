import { inject, injectable } from 'inversify'
import {
    Arg,
    Args,
    Ctx,
    Query,
    Mutation,
    Resolver,
} from 'type-graphql'
import { IPostService } from './interfaces/IPost.service'
import { TYPES } from '../../container/types'
import { Hashtag, Post } from './graphql.models'
import { CreatePostDto } from './dtos'
import { Context } from '../../shared/types'


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

    @Mutation(() => Post)
    public async createPost(@Args() createPostDto: CreatePostDto, @Ctx() { userId }: Context): Promise<Post> {
        return await this._postService.createPost(createPostDto, userId) as unknown as Post
    }
}