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
import { Hashtag, Post, FollowedUsersPosts, UsersWhoLikedPost } from './graphql.models'
import { CreatePostDto, FindFollowedUsersPostsDto, FindUsersWhoLikedPostDto } from './dtos'
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
        const post = await this._postService.createPost(createPostDto, userId)
        return {
            ...post,
            creator: {
                user: post.creator,
                following: false,
            },
        }
    }

    @Query(() => FollowedUsersPosts)
    public async findFollowedUsersPosts(@Args() findFollowedUsersPostsDto: FindFollowedUsersPostsDto, @Ctx() { userId }: Context): Promise<FollowedUsersPosts> {
        return this._postService.findFollowedUsersPosts(findFollowedUsersPostsDto, userId)
    }

    @Query(() => UsersWhoLikedPost)
    public async findUsersWhoLikedPost(@Args() findUsersWhoLikedPostDto: FindUsersWhoLikedPostDto, @Ctx() { userId }: Context): Promise<UsersWhoLikedPost> {
        return this._postService.findUsersWhoLikedPost(findUsersWhoLikedPostDto, userId)
    }
}