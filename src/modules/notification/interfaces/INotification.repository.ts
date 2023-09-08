import { FindNotificationsDto } from '../dtos'
import { INotification } from '../notification.model'
import { Notifications } from '../graphql.models'
import { IUser } from '../../user/db.models/user.model'
import { IPost } from '../../post/db.models/post.model'


export interface INotificationRepository {

    createFollowNotification(followingUser: Pick<IUser, '_id' | 'username' | 'photoUrl'>, followedUserId: string): Promise<INotification>

    createPostLikeNotification(post: Pick<IPost, '_id' | 'photoUrls'>, user: Pick<IUser, '_id' | 'username' | 'photoUrl'>, userId: string): Promise<INotification>

    findDailyNotifications(findNotificationsDto: FindNotificationsDto, userId: string): Promise<Notifications>

    findWeeklyNotifications(findNotificationsDto: FindNotificationsDto, userId: string): Promise<Notifications>

    findMonthlyNotifications(findNotificationsDto: FindNotificationsDto, userId: string): Promise<Notifications>

    findEarlierNotifications(findNotificationsDto: FindNotificationsDto, userId: string): Promise<Notifications>

    updateNotificationsByUser(user: Pick<IUser, '_id' | 'username' | 'photoUrl'>): Promise<void>

}