import { inject, injectable } from 'inversify'
import { INotificationService } from './interfaces/INotification.service'
import { FindNotificationsDto } from './dtos'
import { Notifications, UserHasUnseenNotifications } from './graphql.models'
import { IUserNotificationHistory } from './db.models/user-notification-history.model'
import { TYPES } from '../../container/types'
import { INotificationRepository } from './interfaces/INotification.repository'
import { Types } from 'mongoose'


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

    public async updateNotificationHistoryForUser(userId: string, date: Date): Promise<IUserNotificationHistory> {
        return this._notificationRepository.upsertUserNotificationHistory(userId, date)
    }

    public async findUserHasUnseenNotifications(userId: string): Promise<UserHasUnseenNotifications> {
        const userNotificationHistory = await this._notificationRepository.findUserNotificationHistory(userId)

        const hasUnseenNotifications = await this._notificationRepository.findUserHasUnseenNotifications(userId, userNotificationHistory ? userNotificationHistory.updatedAt as unknown as Date : new Date(0))

        return {
            _id: new Types.ObjectId(userId),
            userId,
            hasUnseenNotifications,
        }
    }
}