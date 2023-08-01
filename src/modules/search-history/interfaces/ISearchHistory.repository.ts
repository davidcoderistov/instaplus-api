import { MarkUserSearchDto } from '../dtos'
import { ISearchHistory } from '../search-history.model'


export interface ISearchHistoryRepository {

    createSearchHistory(searchingUserId: string, markUserSearchDto: MarkUserSearchDto): Promise<ISearchHistory>
}