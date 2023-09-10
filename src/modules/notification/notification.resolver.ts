import { inject, injectable } from 'inversify'
import {
    Args,
    Ctx,
    Query,
    Mutation,
    Resolver, Arg,
} from 'type-graphql'
import { TYPES } from '../../container/types'
import { INotificationService } from './interfaces/INotification.service'
import { Context } from '../../shared/types'
import { FindNotificationsDto } from './dtos'
import { Notifications, UserNotificationHistory, UserHasUnseenNotifications } from './graphql.models'


@injectable()
@Resolver()
export class NotificationResolver {

    constructor(
        @inject(TYPES.INotificationService) private readonly _notificationService: INotificationService) {
    }

    @Query(() => Notifications)
    public async findDailyNotifications(@Args() findNotificationsDto: FindNotificationsDto, @Ctx() { userId }: Context): Promise<Notifications> {
        return this._notificationService.findDailyNotifications(findNotificationsDto, userId)
    }

    @Query(() => Notifications)
    public async findWeeklyNotifications(@Args() findNotificationsDto: FindNotificationsDto, @Ctx() { userId }: Context): Promise<Notifications> {
        return this._notificationService.findWeeklyNotifications(findNotificationsDto, userId)
    }

    @Query(() => Notifications)
    public async findMonthlyNotifications(@Args() findNotificationsDto: FindNotificationsDto, @Ctx() { userId }: Context): Promise<Notifications> {
        return this._notificationService.findMonthlyNotifications(findNotificationsDto, userId)
    }

    @Query(() => Notifications)
    public async findEarlierNotifications(@Args() findNotificationsDto: FindNotificationsDto, @Ctx() { userId }: Context): Promise<Notifications> {
        return this._notificationService.findEarlierNotifications(findNotificationsDto, userId)
    }

    @Mutation(() => UserNotificationHistory)
    public async updateNotificationHistoryForUser(@Arg('date') date: Date, @Ctx() { userId }: Context): Promise<UserNotificationHistory> {
        const userNotificationHistory = await this._notificationService.updateNotificationHistoryForUser(userId, date)
        return userNotificationHistory as unknown as UserNotificationHistory
    }

    @Query(() => UserHasUnseenNotifications)
    public async findUserHasUnseenNotifications(@Ctx() { userId }: Context): Promise<UserHasUnseenNotifications> {
        return this._notificationService.findUserHasUnseenNotifications(userId)
    }
}