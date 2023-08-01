import { UserSearch } from '../graphql.models/user-search.model'
import { MarkUserSearchDto, UnmarkUserSearchDto } from '../dtos'


export interface ISearchHistoryService {

    findUserSearchesBySearchQuery(searchQuery: string): Promise<UserSearch[]>

    markUserSearch(searchingUserId: string, markUserSearchDto: MarkUserSearchDto): Promise<boolean>

    unmarkUserSearch(searchingUserId: string, unmarkUserSearchDto: UnmarkUserSearchDto): Promise<boolean>

    clearSearchHistory(userId: string): Promise<boolean>
}