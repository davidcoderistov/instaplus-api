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

    public async findSearchHistoryForUser(userId: string): Promise<ISearchHistory[]> {
        return SearchHistoryModel
            .find({ searchingUserId: userId })
            .limit(30)
            .lean()
    }

    public async findSearchHistoryAndDelete(searchingUserId: string, searchedUserId: string | null, searchedHashtagId: string | null): Promise<ISearchHistory | null> {
        return SearchHistoryModel.findOneAndDelete({
            searchingUserId,
            searchedUserId,
            searchedHashtagId,
        })
    }

    public async clearSearchHistory(userId: string): Promise<number> {
        const deletedUserSearches: { deletedCount: number } = await SearchHistoryModel.deleteMany({ searchingUserId: userId })
        return deletedUserSearches.deletedCount
    }
}