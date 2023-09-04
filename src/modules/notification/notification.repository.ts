import { injectable } from 'inversify'
import { INotificationRepository } from './interfaces/INotification.repository'
import { INotification, Notification } from './notification.model'
import { IUser } from '../user/db.models/user.model'
import { FindNotificationsDto } from './dtos'
import { Notifications } from './graphql.models'
import { getOffsetPaginatedData } from '../../shared/utils/misc'
import moment from 'moment'


@injectable()
export class NotificationRepository implements INotificationRepository {

    public async findDailyNotifications(findNotificationsDto: FindNotificationsDto, userId: string): Promise<Notifications> {

        const { limit, offset } = findNotificationsDto

        const now = moment()

        const start = now.clone().startOf('day').toDate()

        const end = now.clone().add(1, 'days').startOf('day').toDate()

        return await NotificationRepository.findNotificationsForUser(
            start,
            end,
            userId,
            offset,
            limit,
            'hour') as unknown as Notifications
    }

    public async findWeeklyNotifications(findNotificationsDto: FindNotificationsDto, userId: string): Promise<Notifications> {

        const { limit, offset } = findNotificationsDto

        const now = moment()

        const start = now.clone().startOf('week').toDate()

        const end = now.clone().startOf('day').toDate()

        return await NotificationRepository.findNotificationsForUser(
            start,
            end,
            userId,
            offset,
            limit,
            'day') as unknown as Notifications
    }

    public async findMonthlyNotifications(findNotificationsDto: FindNotificationsDto, userId: string): Promise<Notifications> {

        const { limit, offset } = findNotificationsDto

        const now = moment()

        const start = now.clone().startOf('month').toDate()

        const end = now.clone().startOf('week').toDate()

        return await NotificationRepository.findNotificationsForUser(
            start,
            end,
            userId,
            offset,
            limit,
            'day') as unknown as Notifications
    }

    public async findEarlierNotifications(findNotificationsDto: FindNotificationsDto, userId: string): Promise<Notifications> {
        const { limit, offset } = findNotificationsDto

        const now = moment()

        const start = now.clone().subtract(4, 'months').toDate()

        const end = now.clone().startOf('month').toDate()

        return await NotificationRepository.findNotificationsForUser(
            start,
            end,
            userId,
            offset,
            limit,
            'week') as unknown as Notifications
    }

    private static async findNotificationsForUser(
        startDate: Date,
        endDate: Date,
        userId: string,
        offset: number,
        limit: number,
        granularity: 'hour' | 'day' | 'week'): Promise<{ data: INotification[], count: number }> {

        let format
        if (granularity === 'hour') {
            format = '%Y-%m-%d %H:00:00'
        } else if (granularity === 'day') {
            format = '%Y-%m-%d'
        } else {
            format = '%Y-%U'
        }

        const aggregateNotifications = await Notification.aggregate(
            [
                {
                    $match: {
                        userId,
                        createdAt: { $gte: startDate, $lt: endDate },
                    },
                },
                {
                    $sort: { createdAt: -1 },
                },
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format, date: '$createdAt' } },
                            postId: '$post._id',
                            type: '$type',
                        },
                        notifications: { $push: '$$ROOT' },
                        post: { $first: '$post' },
                    },
                },
                {
                    $unwind: '$notifications',
                },
                {
                    $sort: { 'notifications.createdAt': -1 },
                },
                {
                    $group: {
                        _id: '$_id',
                        notificationId: { $first: '$notifications._id' },
                        post: { $first: '$post' },
                        createdAt: { $first: '$notifications.createdAt' },
                        latestUsers: {
                            $push: {
                                _id: '$notifications.user._id',
                                username: '$notifications.user.username',
                                photoUrl: '$notifications.user.photoUrl',
                            },
                        },
                    },
                },
                {
                    $addFields: {
                        latestUsers: {
                            $reduce: {
                                input: '$latestUsers',
                                initialValue: [],
                                in: {
                                    $cond: {
                                        if: { $in: ['$$this._id', '$$value._id'] },
                                        then: '$$value',
                                        else: { $concatArrays: ['$$value', ['$$this']] },
                                    },
                                },
                            },
                        },
                    },
                },
                {
                    $addFields: {
                        lastTwoLatestUsers: { $slice: ['$latestUsers', 0, 2] },
                    },
                },
                {
                    $group: {
                        _id: '$_id',
                        notificationId: { $first: '$notificationId' },
                        post: { $first: '$post' },
                        createdAt: { $first: '$createdAt' },
                        latestUsers: { $first: '$lastTwoLatestUsers' },
                        usersCount: { $first: { $size: '$latestUsers' } },
                    },
                },
                {
                    $sort: { createdAt: -1 },
                },
                {
                    $project: {
                        _id: '$notificationId',
                        type: '$_id.type',
                        post: 1,
                        createdAt: 1,
                        latestUsers: 1,
                        usersCount: 1,
                    },
                },
                {
                    $facet: {
                        metadata: [{
                            $count: 'count',
                        }],
                        data: [{
                            $skip: offset,
                        }, {
                            $limit: limit,
                        }],
                    },
                },
            ],
        )
        return getOffsetPaginatedData(aggregateNotifications)
    }

    public async updateNotificationsByUser(user: Pick<IUser, '_id' | 'username' | 'photoUrl'>): Promise<void> {
        const now = moment()

        const startDate = now.clone().subtract(4, 'months').toDate()

        await Notification.updateMany({ 'user._id': user._id, createdAt: { $gte: startDate } }, { $set: { user } })
    }
}