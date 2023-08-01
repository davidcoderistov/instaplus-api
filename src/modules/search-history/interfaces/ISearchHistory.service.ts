import { UserSearch } from '../graphql.models/user-search.model'
import { MarkUserSearchDto } from '../dtos'


export interface ISearchHistoryService {

    findUserSearchesBySearchQuery(searchQuery: string): Promise<UserSearch[]>

    markUserSearch(searchingUserId: string, markUserSearchDto: MarkUserSearchDto): Promise<boolean>
}