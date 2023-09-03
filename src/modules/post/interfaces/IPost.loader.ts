import { Post } from '../graphql.models'


export interface IPostLoader {

    loadSuggestedPosts(userId: string): Promise<Post[]>

    clearSuggestedPosts(userId: string): void
}