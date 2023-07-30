import { inject, injectable } from 'inversify'
import { INotificationService } from './interfaces/INotification.service'
import { FindNotificationsDto } from './dtos'
import { Notifications } from './graphql.models'
import { TYPES } from '../../container/types'
import { INotificationRepository } from './interfaces/INotification.repository'


@injectable()
export class NotificationService implements INotificationService {

    constructor(
        @inject(TYPES.INotificationRepository) private readonly _notificationRepository: INotificationRepository) {
    }

    public async findDailyNotifications(findNotificationsDto: FindNotificationsDto, userId: string): Promise<Notifications> {
        return this._notificationRepository.findDailyNotifications(findNotificationsDto, userId)
    }

    public async findWeeklyNotifications(findNotificationsDto: FindNotificationsDto, userId: string): Promise<Notifications> {
        return this._notificationRepository.findWeeklyNotifications(findNotificationsDto, userId)
    }

    public async findMonthlyNotifications(findNotificationsDto: FindNotificationsDto, userId: string): Promise<Notifications> {
        return this._notificationRepository.findMonthlyNotifications(findNotificationsDto, userId)
    }

    public async findEarlierNotifications(findNotificationsDto: FindNotificationsDto, userId: string): Promise<Notifications> {
        return this._notificationRepository.findEarlierNotifications(findNotificationsDto, userId)
    }
}