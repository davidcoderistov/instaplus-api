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
import { IPostLoader } from './interfaces/IPost.loader'
import { TYPES } from '../../container/types'
import {
    Hashtag,
    Post,
    FollowedUsersPosts,
    UsersWhoLikedPost,
    PostLike,
    CommentsForPost,
    UsersWhoLikedComment,
    CommentLike,
    CommentReplies,
    Comment,
    PostDetails,
    PostsForUser,
    SavedPostsForUser,
    PostsForHashtag,
    SuggestedPosts,
} from './graphql.models'
import {
    CreatePostDto,
    CreateCommentDto,
    FindFollowedUsersPostsDto,
    FindUsersWhoLikedPostDto,
    FindCommentsForPostDto,
    FindUsersWhoLikedCommentDto,
    FindCommentRepliesDto,
    FindPostsForUserDto,
    FindLatestPostsForUserDto,
    FindSavedPostsForUserDto,
    FindPostsForHashtagDto,
    FindSuggestedPostsDto,
} from './dtos'
import { Context } from '../../shared/types'


@injectable()
@Resolver()
export class PostResolver {

    constructor(
        @inject(TYPES.IPostService) private readonly _postService: IPostService,
        @inject(TYPES.IPostLoader) private readonly _postLoader: IPostLoader) {
    }

    @Query(() => [Hashtag])
    public async findHashtagsBySearchQuery(@Arg('searchQuery') searchQuery: string): Promise<Hashtag[]> {
        return this._postService.findHashtagsBySearchQuery(searchQuery, 15)
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
        } as unknown as Post
    }

    @Mutation(() => Comment)
    public async createComment(@Args() createCommentDto: CreateCommentDto, @Ctx() { userId }: Context): Promise<Comment> {
        const comment = await this._postService.createComment(createCommentDto, userId)
        return {
            ...comment,
            liked: false,
            likesCount: 0,
            repliesCount: 0,
        } as unknown as Comment
    }

    @Query(() => FollowedUsersPosts)
    public async findFollowedUsersPosts(@Args() findFollowedUsersPostsDto: FindFollowedUsersPostsDto, @Ctx() { userId }: Context): Promise<FollowedUsersPosts> {
        return this._postService.findFollowedUsersPosts(findFollowedUsersPostsDto, userId)
    }

    @Query(() => UsersWhoLikedPost)
    public async findUsersWhoLikedPost(@Args() findUsersWhoLikedPostDto: FindUsersWhoLikedPostDto, @Ctx() { userId }: Context): Promise<UsersWhoLikedPost> {
        return this._postService.findUsersWhoLikedPost(findUsersWhoLikedPostDto, userId)
    }

    @Mutation(() => PostLike)
    public async likePost(@Arg('postId') postId: string, @Ctx() { userId }: Context): Promise<PostLike> {
        return await this._postService.likePost(postId, userId) as unknown as PostLike
    }

    @Mutation(() => PostLike)
    public async unlikePost(@Arg('postId') postId: string, @Ctx() { userId }: Context): Promise<PostLike> {
        return await this._postService.unlikePost(postId, userId) as unknown as PostLike
    }

    @Mutation(() => Post)
    public async savePost(@Arg('postId') postId: string, @Ctx() { userId }: Context): Promise<Post> {
        return await this._postService.savePost(postId, userId) as unknown as Post
    }

    @Mutation(() => Post)
    public async unsavePost(@Arg('postId') postId: string, @Ctx() { userId }: Context): Promise<Post> {
        return await this._postService.unsavePost(postId, userId) as unknown as Post
    }

    @Query(() => CommentsForPost)
    public async findCommentsForPost(@Args() findCommentsForPostDto: FindCommentsForPostDto, @Ctx() { userId }: Context): Promise<CommentsForPost> {
        return this._postService.findCommentsForPost(findCommentsForPostDto, userId)
    }

    @Query(() => UsersWhoLikedComment)
    public async findUsersWhoLikedComment(@Args() findUsersWhoLikedCommentDto: FindUsersWhoLikedCommentDto, @Ctx() { userId }: Context): Promise<UsersWhoLikedComment> {
        return this._postService.findUsersWhoLikedComment(findUsersWhoLikedCommentDto, userId)
    }

    @Mutation(() => CommentLike)
    public async likeComment(@Arg('commentId') commentId: string, @Ctx() { userId }: Context): Promise<CommentLike> {
        return await this._postService.likeComment(commentId, userId) as unknown as CommentLike
    }

    @Mutation(() => CommentLike)
    public async unlikeComment(@Arg('commentId') commentId: string, @Ctx() { userId }: Context): Promise<CommentLike> {
        return await this._postService.unlikeComment(commentId, userId) as unknown as CommentLike
    }

    @Query(() => CommentReplies)
    public async findCommentReplies(@Args() findCommentRepliesDto: FindCommentRepliesDto, @Ctx() { userId }: Context): Promise<CommentReplies> {
        return this._postService.findCommentReplies(findCommentRepliesDto, userId)
    }

    @Query(() => PostDetails)
    public async findPostDetailsById(@Arg('postId') postId: string, @Ctx() { userId }: Context): Promise<PostDetails | null> {
        return this._postService.findPostDetailsById(postId, userId)
    }

    @Query(() => PostsForUser)
    public async findPostsForUser(@Args() findPostsForUserDto: FindPostsForUserDto): Promise<PostsForUser> {
        return this._postService.findPostsForUser(findPostsForUserDto)
    }

    @Query(() => [Post])
    public async findLatestPostsForUser(@Args() { userId, limit }: FindLatestPostsForUserDto): Promise<Post[]> {
        const postsForUser = await this._postService.findPostsForUser({ offset: 0, limit, userId })
        return postsForUser.data as unknown as Post[]
    }

    @Query(() => SavedPostsForUser)
    public async findSavedPostsForUser(@Args() findSavedPostsForUserDto: FindSavedPostsForUserDto, @Ctx() { userId }: Context): Promise<SavedPostsForUser> {
        return this._postService.findSavedPostsForUser(findSavedPostsForUserDto, userId)
    }

    @Query(() => PostsForHashtag)
    public async findPostsForHashtag(@Args() findPostsForHashtagDto: FindPostsForHashtagDto): Promise<PostsForHashtag> {
        return this._postService.findPostsForHashtag(findPostsForHashtagDto)
    }

    @Query(() => SuggestedPosts)
    public async findSuggestedPosts(@Args() {
        offset,
        limit,
    }: FindSuggestedPostsDto, @Ctx() { userId }: Context): Promise<SuggestedPosts> {
        if (offset === 0) {
            this._postLoader.clearSuggestedPosts(userId)
        }
        const suggestedPosts = await this._postLoader.loadSuggestedPosts(userId)
        return {
            data: suggestedPosts.slice(offset, offset + limit),
            count: suggestedPosts.length,
        }
    }
}