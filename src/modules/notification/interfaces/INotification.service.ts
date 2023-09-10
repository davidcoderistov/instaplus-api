import { FindNotificationsDto } from '../dtos'
import { Notifications, UserHasUnseenNotifications } from '../graphql.models'
import { IUserNotificationHistory } from '../db.models/user-notification-history.model'


export interface INotificationService {

    findDailyNotifications(findNotificationsDto: FindNotificationsDto, userId: string): Promise<Notifications>

    findWeeklyNotifications(findNotificationsDto: FindNotificationsDto, userId: string): Promise<Notifications>

    findMonthlyNotifications(findNotificationsDto: FindNotificationsDto, userId: string): Promise<Notifications>

    findEarlierNotifications(findNotificationsDto: FindNotificationsDto, userId: string): Promise<Notifications>

    updateNotificationHistoryForUser(userId: string, date: Date): Promise<IUserNotificationHistory>

    findUserHasUnseenNotifications(userId: string): Promise<UserHasUnseenNotifications>

}