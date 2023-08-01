import { inject, injectable } from 'inversify'
import { Resolver, Query, Mutation, Args, Arg, Ctx } from 'type-graphql'
import { TYPES } from '../../container/types'
import { ISearchHistoryService } from './interfaces/ISearchHistory.service'
import { MarkUserSearchDto, UnmarkUserSearchDto } from './dtos'
import { UserSearch } from './graphql.models/user-search.model'
import { Context } from '../../shared/types'


@injectable()
@Resolver()
export class SearchHistoryResolver {

    constructor(
        @inject(TYPES.ISearchHistoryService) private readonly _searchHistoryService: ISearchHistoryService) {
    }

    @Query(() => [UserSearch])
    public async findUserSearchesBySearchQuery(@Arg('searchQuery') searchQuery: string): Promise<UserSearch[]> {
        return this._searchHistoryService.findUserSearchesBySearchQuery(searchQuery)
    }

    @Mutation(() => Boolean)
    public async markUserSearch(@Args() markUserSearchDto: MarkUserSearchDto, @Ctx() { userId }: Context): Promise<boolean> {
        return this._searchHistoryService.markUserSearch(userId, markUserSearchDto)
    }

    @Mutation(() => Boolean)
    public async unmarkUserSearch(@Args() unmarkUserSearchDto: UnmarkUserSearchDto, @Ctx() { userId }: Context): Promise<boolean> {
        return this._searchHistoryService.unmarkUserSearch(userId, unmarkUserSearchDto)
    }

    @Query(() => [UserSearch])
    public async findSearchHistory(@Ctx() { userId }: Context): Promise<UserSearch[]> {
        return this._searchHistoryService.findSearchHistory(userId)
    }

    @Mutation(() => Boolean)
    public async clearSearchHistory(@Ctx() { userId }: Context): Promise<boolean> {
        return this._searchHistoryService.clearSearchHistory(userId)
    }
}