import { inject, injectable } from 'inversify'
import { IPostLoader } from './interfaces/IPost.loader'
import { IPostService } from './interfaces/IPost.service'
import { TYPES } from '../../container/types'
import DataLoader from 'dataloader'
import { Post } from './graphql.models'


@injectable()
export class PostLoader implements IPostLoader {

    private static postsLoader: DataLoader<string, Post[], string> | null = null

    constructor(
        @inject(TYPES.IPostService) private readonly _postService: IPostService,
    ) {
        if (!PostLoader.postsLoader) {
            PostLoader.postsLoader = new DataLoader(async (userIds: readonly string[]) => {
                const suggestedPostsByUser = await Promise.all(
                    userIds.map(async (userId) => {
                        const suggestedPosts = await this._postService.findSuggestedPosts(userId)
                        return { userId, suggestedPosts }
                    }),
                )

                const suggestedPostsByUserObject: { [key: string]: Post[] } = suggestedPostsByUser
                    .reduce((result: { [key: string]: Post[] }, { userId, suggestedPosts }) => ({
                        ...result,
                        [userId]: suggestedPosts,
                    }), {})

                return userIds.map((userId) => suggestedPostsByUserObject[userId])
            })
        }
    }

    public async loadSuggestedPosts(userId: string): Promise<Post[]> {
        return PostLoader.getLoader().load(userId)
    }

    public clearSuggestedPosts(userId: string): void {
        PostLoader.getLoader().clear(userId)
    }

    private static getLoader(): DataLoader<string, Post[]> {
        return PostLoader.postsLoader as DataLoader<string, Post[], string>
    }
}