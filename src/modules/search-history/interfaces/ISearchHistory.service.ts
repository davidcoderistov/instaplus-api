import { UserSearch } from '../graphql.models/user-search.model'


export interface ISearchHistoryService {

    findUserSearchesBySearchQuery(searchQuery: string): Promise<UserSearch[]>
}