import { inject, injectable } from 'inversify'
import {
    Args,
    Ctx,
    Query,
    Resolver,
} from 'type-graphql'
import { TYPES } from '../../container/types'
import { INotificationService } from './interfaces/INotification.service'
import { Context } from '../../shared/types'
import { FindNotificationsDto } from './dtos'
import { Notifications } from './graphql.models'


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
}