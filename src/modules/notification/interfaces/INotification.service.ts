import { FindNotificationsDto } from '../dtos'
import { Notifications } from '../graphql.models'


export interface INotificationService {

    findDailyNotifications(findNotificationsDto: FindNotificationsDto, userId: string): Promise<Notifications>

    findWeeklyNotifications(findNotificationsDto: FindNotificationsDto, userId: string): Promise<Notifications>

    findMonthlyNotifications(findNotificationsDto: FindNotificationsDto, userId: string): Promise<Notifications>

    findEarlierNotifications(findNotificationsDto: FindNotificationsDto, userId: string): Promise<Notifications>

}