import { injectable } from 'inversify'
import { INotificationRepository } from './interfaces/INotification.repository'
import { INotification, Notification } from './notification.model'
import { FindNotificationsDto } from './dtos'
import { Notifications } from './graphql.models'
import moment from 'moment'


@injectable()
export class NotificationRepository implements INotificationRepository {

    public async findDailyNotifications(findNotificationsDto: FindNotificationsDto, userId: string): Promise<Notifications> {

        const { limit, cursor } = findNotificationsDto

        const now = moment()

        const startDay = now.clone().startOf('day').toDate()

        const nextDay = now.clone().add(1, 'days').startOf('day').toDate()

        return await this.findNotificationsForUser(
            startDay,
            nextDay,
            userId,
            limit,
            cursor ? cursor.createdAt : null,
            'hour') as unknown as Notifications
    }

    public async findWeeklyNotifications(findNotificationsDto: FindNotificationsDto, userId: string): Promise<Notifications> {

        const { limit, cursor } = findNotificationsDto

        const now = moment()

        const startWeek = now.clone().startOf('week').toDate()

        const nextWeek = now.clone().add(1, 'weeks').startOf('week').toDate()

        return await this.findNotificationsForUser(
            startWeek,
            nextWeek,
            userId,
            limit,
            cursor ? cursor.createdAt : null,
            'day') as unknown as Notifications
    }

    public async findEarlierNotifications(findNotificationsDto: FindNotificationsDto, userId: string): Promise<Notifications> {
        const { limit, cursor } = findNotificationsDto

        const now = moment()

        const threeMonthsBefore = now.clone().subtract(3, 'months').toDate()

        const startWeek = now.clone().startOf('week').toDate()

        return await this.findNotificationsForUser(
            threeMonthsBefore,
            startWeek,
            userId,
            limit,
            cursor ? cursor.createdAt : null,
            'week') as unknown as Notifications
    }

    public async findNotificationsForUser(
        startDate: Date,
        endDate: Date,
        userId: string,
        limit: number,
        createdAt: Date | null,
        granularity: 'hour' | 'day' | 'week'): Promise<{ data: INotification[], nextCursor: { _id: string, createdAt: Date } | null }> {

        let format
        if (granularity === 'hour') {
            format = '%Y-%m-%d %H:00:00'
        } else if (granularity === 'day') {
            format = '%Y-%m-%d'
        } else {
            format = '%Y-%U'
        }

        return await Notification.aggregate(
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
                        post: { $first: '$post' },
                        createdAt: { $first: '$createdAt' },
                        latestUsers: { $addToSet: '$lastTwoLatestUsers' },
                        usersCount: { $first: { $size: '$latestUsers' } },
                    },
                },
                {
                    $sort: { createdAt: -1 },
                },
                {
                    $project: {
                        _id: { $toObjectId: '$_id.postId' },
                        type: '$_id.type',
                        post: 1,
                        createdAt: { $dateFromString: { dateString: '$_id.date' } },
                        latestUsers: 1,
                        usersCount: 1,
                    },
                },
                ...(createdAt ? [
                    {
                        $match: {
                            createdAt: { $lte: createdAt },
                        },
                    },
                ] : []),
                {
                    $facet: {
                        data: [
                            { $limit: limit },
                        ],
                        nextCursor: [
                            { $skip: limit },
                            {
                                $limit: 1,
                            },
                            {
                                $project: {
                                    _id: '$_id',
                                    createdAt: '$createdAt',
                                },
                            },
                        ],
                    },
                },
            ],
        ) as unknown as { data: INotification[], nextCursor: { _id: string, createdAt: Date } | null }
    }
}