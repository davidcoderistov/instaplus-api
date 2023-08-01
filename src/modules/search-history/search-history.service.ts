import { inject, injectable } from 'inversify'
import { ISearchHistoryService } from './interfaces/ISearchHistory.service'
import { IUserRepository } from '../user/interfaces/IUser.repository'
import { IPostRepository } from '../post/interfaces/IPost.repository'
import { TYPES } from '../../container/types'
import { UserSearch } from './graphql.models/user-search.model'
import { SearchUser } from '../user/graphql.models'
import { IHashtag } from '../post/db.models/hashtag.model'


@injectable()
export class SearchHistoryService implements ISearchHistoryService {

    constructor(
        @inject(TYPES.IUserRepository) private readonly _userRepository: IUserRepository,
        @inject(TYPES.IPostRepository) private readonly _postRepository: IPostRepository) {
    }

    public async findUserSearchesBySearchQuery(searchQuery: string): Promise<UserSearch[]> {
        const searchUsers = await this._userRepository.findSearchUsersBySearchQuery(searchQuery, 15)
        const hashtags = await this._postRepository.findHashtagsBySearchQuery(searchQuery, 15)

        const userSearches: (SearchUser | IHashtag)[] = [...searchUsers, ...hashtags]

        return userSearches.sort((a, b) => {
            const first = 'name' in a ? a.name : a.user.username
            const second = 'name' in b ? b.name : b.user.username
            return first.localeCompare(second)
        }).map(userSearch => {
            if ('name' in userSearch) {
                return {
                    searchUser: null,
                    hashtag: userSearch,
                }
            }
            return {
                searchUser: userSearch,
                hashtag: null,
            }
        })
    }
}