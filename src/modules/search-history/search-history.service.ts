import { inject, injectable } from 'inversify'
import { ISearchHistoryService } from './interfaces/ISearchHistory.service'
import { ISearchHistoryRepository } from './interfaces/ISearchHistory.repository'
import { IUserRepository } from '../user/interfaces/IUser.repository'
import { IPostRepository } from '../post/interfaces/IPost.repository'
import { TYPES } from '../../container/types'
import { UserSearch } from './graphql.models/user-search.model'
import { SearchUser } from '../user/graphql.models'
import { IHashtag } from '../post/db.models/hashtag.model'
import { MarkUserSearchDto, UnmarkUserSearchDto } from './dtos'
import { CustomValidationException, MongodbServerException } from '../../shared/exceptions'


@injectable()
export class SearchHistoryService implements ISearchHistoryService {

    constructor(
        @inject(TYPES.ISearchHistoryRepository) private readonly _searchHistoryRepository: ISearchHistoryRepository,
        @inject(TYPES.IUserRepository) private readonly _userRepository: IUserRepository,
        @inject(TYPES.IPostRepository) private readonly _postRepository: IPostRepository) {
    }

    public async findUserSearchesBySearchQuery(userId: string, searchQuery: string): Promise<UserSearch[]> {
        const searchUsers = await this._userRepository.findSearchUsersBySearchQuery(userId, searchQuery, 15)
        const hashtags = await this._postRepository.findHashtagsBySearchQuery(searchQuery, 15)

        return SearchHistoryService.sortUserSearches([...searchUsers, ...hashtags])
    }

    public async markUserSearch(searchingUserId: string, markUserSearchDto: MarkUserSearchDto): Promise<boolean> {
        try {
            if (!await this._userRepository.findUserById(searchingUserId)) {
                return Promise.reject(new CustomValidationException('searchingUserId', `User with id ${searchingUserId} does not exist`))
            }

            const { searchedUserId, searchedHashtagId } = markUserSearchDto

            if (searchedUserId) {
                if (!await this._userRepository.findUserById(searchedUserId)) {
                    return Promise.reject(new CustomValidationException('searchedUserId', `User with id ${searchedUserId} does not exist`))
                }
            }

            if (searchedHashtagId) {
                if (!await this._postRepository.findHashtagById(searchedHashtagId)) {
                    return Promise.reject(new CustomValidationException('searchedHashtagId', `Hashtag with id ${searchedHashtagId} does not exist`))
                }
            }

            await this._searchHistoryRepository.findSearchHistoryAndDelete(searchingUserId, searchedUserId ?? null, searchedHashtagId ?? null)

            await this._searchHistoryRepository.createSearchHistory(searchingUserId, markUserSearchDto)

            return true
        } catch (err) {
            throw err
        }
    }

    public async unmarkUserSearch(searchingUserId: string, unmarkUserSearchDto: UnmarkUserSearchDto): Promise<boolean> {
        try {
            if (!await this._userRepository.findUserById(searchingUserId)) {
                return Promise.reject(new CustomValidationException('searchingUserId', `User with id ${searchingUserId} does not exist`))
            }

            const { searchedUserId, searchedHashtagId } = unmarkUserSearchDto

            if (!searchedUserId && !searchedHashtagId) {
                return Promise.reject(new MongodbServerException('At least and only one field(searchedUserId, searchedHashtagId) should be present'))
            }

            if (searchedUserId) {
                if (!await this._userRepository.findUserById(searchedUserId)) {
                    return Promise.reject(new CustomValidationException('searchedUserId', `User with id ${searchedUserId} does not exist`))
                }
            }

            if (searchedHashtagId) {
                if (!await this._postRepository.findHashtagById(searchedHashtagId)) {
                    return Promise.reject(new CustomValidationException('searchedHashtagId', `Hashtag with id ${searchedHashtagId} does not exist`))
                }
            }

            if (!await this._searchHistoryRepository.findSearchHistoryAndDelete(searchingUserId, searchedUserId ?? null, searchedHashtagId ?? null)) {
                return Promise.reject(new CustomValidationException(
                    searchedUserId ? 'searchedUserId' : 'searchedHashtagId',
                    `${searchedUserId ? 'User' : 'Hashtag'} with id ${searchedUserId ? searchedUserId : searchedHashtagId} does not exist`))
            }

            return true
        } catch (err) {
            throw err
        }
    }

    public async findSearchHistory(userId: string): Promise<UserSearch[]> {
        const searchHistory = await this._searchHistoryRepository.findSearchHistoryForUser(userId)

        const userIds = searchHistory
            .filter(searchHistory => searchHistory.searchedUserId)
            .map(searchHistory => searchHistory.searchedUserId) as string[]

        const hashtagIds = searchHistory
            .filter(searchHistory => searchHistory.searchedHashtagId)
            .map(searchHistory => searchHistory.searchedHashtagId) as string[]

        const searchUsers = await this._userRepository.findSearchUsersByIds(userId, userIds, 15)
        const searchUsersMap: { [key: string]: SearchUser } = searchUsers.reduce((searchUsersMap, searchUser) => ({
            ...searchUsersMap,
            [searchUser.user._id.toString()]: searchUser,
        }), {})

        const hashtags = await this._postRepository.findHashtagsByIds(hashtagIds, 15)
        const hashtagsMap: { [key: string]: IHashtag } = hashtags.reduce((hashtagsMap, hashtag) => ({
            ...hashtagsMap,
            [hashtag._id.toString()]: hashtag,
        }), {})

        return searchHistory.map(searchHistory => {
            if (searchHistory.searchedUserId) {
                return {
                    searchUser: searchUsersMap[searchHistory.searchedUserId] as SearchUser,
                    hashtag: null,
                }
            } else {
                const hashtagId = searchHistory.searchedHashtagId as string
                return {
                    searchUser: null,
                    hashtag: hashtagsMap[hashtagId] as IHashtag,
                }
            }
        })
    }

    public async clearSearchHistory(userId: string): Promise<boolean> {
        try {
            if (!await this._userRepository.findUserById(userId)) {
                return Promise.reject(new CustomValidationException('searchingUserId', `User with id ${userId} does not exist`))
            }

            return await this._searchHistoryRepository.clearSearchHistory(userId) > 0
        } catch (err) {
            throw err
        }
    }

    private static sortUserSearches(userSearches: (SearchUser | IHashtag)[]) {
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