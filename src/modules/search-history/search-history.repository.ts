import { injectable } from 'inversify'
import { ISearchHistoryRepository } from './interfaces/ISearchHistory.repository'
import SearchHistoryModel, { ISearchHistory } from './search-history.model'
import { MarkUserSearchDto } from './dtos'


@injectable()
export class SearchHistoryRepository implements ISearchHistoryRepository {

    public async createSearchHistory(searchingUserId: string, markUserSearchDto: MarkUserSearchDto): Promise<ISearchHistory> {
        const { searchedUserId, searchedHashtagId } = markUserSearchDto
        const searchHistory = new SearchHistoryModel({
            searchingUserId,
            searchedUserId,
            searchedHashtagId,
        })
        await searchHistory.save()
        return searchHistory.toObject()
    }
}