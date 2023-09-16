import { injectable } from 'inversify'
import { ISeederService } from './ISeeder.service'
import UserModel, { IUser } from '../user/db.models/user.model'
import ChatModel, { IChat } from '../chat/db.models/chat.model'
import MessageModel, { IMessage } from '../chat/db.models/message.model'
import FollowModel from '../user/db.models/follow.model'
import { FollowNotification } from '../notification/db.models/notification.model'
import { faker } from '@faker-js/faker'
import _range from 'lodash/range'
import _random from 'lodash/random'
import _sampleSize from 'lodash/sampleSize'
import moment from 'moment'


@injectable()
export class SeederService implements ISeederService {

    private static readonly maleAvatars = [
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1680259449/storage/avatars/1679066351700-JacobHall_ore2qt.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1680259414/storage/avatars/1679066571960-JesseJames_kfqtmy.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1680259343/storage/avatars/1679066398672-JamesGreen_pi94cc.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1680259310/storage/avatars/1679067166721-BobAllison_ucgwi3.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1680259277/storage/avatars/1679067043506-DavidRobertson_vpec38.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1680259247/storage/avatars/1679067211937-GraceMitchell_ozcrnq.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1680259218/storage/avatars/1679066882678-MichaelBurry_exmunv.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1680259144/storage/avatars/1679067310874-ChrisTurner_cpltud.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1680259063/storage/avatars/1679067246463-JohnParker_atdfpt.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1680258899/storage/avatars/1679066761500-JamesRickards_xnnrgi.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1680258820/storage/avatars/1679066956729-EthanWilson_jzojmz.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1680258779/storage/avatars/1679066313561-MathewKing_xd4k1x.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1680258743/storage/avatars/1679067377920-BenjaminCowen_yvbsg9.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1680258705/storage/avatars/1679066725425-LanceRoberts_cll19e.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1680258660/storage/avatars/1679066683446-JohnDoe_oqgpyg.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1680258510/storage/avatars/1679066038798-DavidJohnson_yoygkf.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1680258473/storage/avatars/1679066800916-DavidSmith_gyubjt.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1680258346/storage/avatars/1679066154949-GeorgeMartin_zrbdja.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694462447/instaplus/storage/avatars/uzb39ffkyuxrmghitzx3.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694462396/instaplus/storage/avatars/ktbgqimfobtzsb9kp28y.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694462339/instaplus/storage/avatars/qe3wid8wrq5jcv2cwahg.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694462325/instaplus/storage/avatars/l8sxxtqovpky2fzgrbuh.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694462306/instaplus/storage/avatars/tjiltfjzrq6nzymhkem9.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694462292/instaplus/storage/avatars/mpsbrqozbxp93xddkd7s.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694462268/instaplus/storage/avatars/rkh2hvyahsqaebrupyed.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694462166/instaplus/storage/avatars/ozxd5yhlc8noo5csm3lf.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694462150/instaplus/storage/avatars/ir9qqhowluqgljwbzano.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694462139/instaplus/storage/avatars/cs0jetrf19xidsakt3je.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694462123/instaplus/storage/avatars/kk76lhu3f2qn5obv6a5r.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694462108/instaplus/storage/avatars/drjkut1abrpeuwopxpek.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694462085/instaplus/storage/avatars/mdai7cmg0pkvvxgbpbyp.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694462048/instaplus/storage/avatars/vs6jpjmymqgxkrvjv5rf.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694462029/instaplus/storage/avatars/gwppyzgcqlt1qefyvadh.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694461818/instaplus/storage/avatars/mcdxqenyycepo6ctcoby.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694461805/instaplus/storage/avatars/rl2d4bctkoqbyjoh2do8.png',
    ]

    private static readonly femaleAvatars = [
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1680259370/storage/avatars/1679066119037-SophiaWright_si7d2x.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1680259182/storage/avatars/1679066271174-AbigailWhite_cnjgzo.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1680259105/storage/avatars/1679066433892-AnnaTaylor_fs59qp.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1680259017/storage/avatars/1679067346980-VictoriaHill_ekqnox.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1680258980/storage/avatars/1679067276293-EmilyFoster_fzaobu.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1680258928/storage/avatars/1679067426167-IsabellaPhillips_bxquac.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1680258861/storage/avatars/1679066515959-CharlotteBlue_dmncy3.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1680258629/storage/avatars/1679066477038-LilyJackson_swgsx2.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1680258595/storage/avatars/1679066236112-FaithDavis_mp5f7z.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1680258549/storage/avatars/1679066920676-OliviaDavis_tfzu4j.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1680258442/storage/avatars/1679066838757-AvaThompson_h3b7lg.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1680258386/storage/avatars/1679066190246-AmeliaParker_m9clpe.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1680258312/storage/avatars/1679066649560-EmmaWilliams_a1xkaj.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694462432/instaplus/storage/avatars/opllywuhhduf4bnqjq4g.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694462419/instaplus/storage/avatars/oqzezunezyte2zhhz6ly.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694462408/instaplus/storage/avatars/cxpbeihxrdinqsggopsb.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694462384/instaplus/storage/avatars/qxdkdmcpfxwxvp1wvc28.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694462369/instaplus/storage/avatars/bjqswvdq4eygtb6jb099.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694462359/instaplus/storage/avatars/rjwwde88b8gd7pcvyk4r.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694462251/instaplus/storage/avatars/wcw6hnszptyjywd4e8ft.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694462231/instaplus/storage/avatars/eg0xezekhm11ivsf7zay.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694462210/instaplus/storage/avatars/m5hsbrthfswjsoofijqq.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694462196/instaplus/storage/avatars/wyg814uc868q2c9lsnng.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694462181/instaplus/storage/avatars/wgqyohyb2l32sacfwn3z.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694462063/instaplus/storage/avatars/yzox0mybkgyzeb6lkvwa.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694462009/instaplus/storage/avatars/dyh1g7vmy8bqvyk3xga7.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694461991/instaplus/storage/avatars/aw1mnl1o1zwt0prmbgbl.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694461979/instaplus/storage/avatars/bvnnsuhxngj53lp3g4o0.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694461965/instaplus/storage/avatars/eydx7gpmieehog3gcrhj.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694461947/instaplus/storage/avatars/kbizbxjazopkzrn2svsh.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694461931/instaplus/storage/avatars/i5xhpoqcpk6qk6fssofi.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694461916/instaplus/storage/avatars/r4bnfse1ty3sxwxemji0.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694461899/instaplus/storage/avatars/idczszy10mplgbtbdwdz.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694461884/instaplus/storage/avatars/tbzpgygyexbue02lu5i8.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694461866/instaplus/storage/avatars/lec1mrdp0nm1vx1nb1lc.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694461846/instaplus/storage/avatars/wldtcjhayfx60o346ui9.png',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694461832/instaplus/storage/avatars/np9zjgadnvyuivr1sjgj.png',
    ]

    private static readonly messagePhotoUrls = [
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694707669/instaplus/storage/chat/64b3e50caf9cefccb764e6c7/sqhmwofzz1nnbgzoi3no.jpg',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694707649/instaplus/storage/chat/64b3e50caf9cefccb764e6c7/xvvzhcqd48radyslse3i.jpg',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694707582/instaplus/storage/chat/64b3e50caf9cefccb764e6c7/ooqmhmx6pjnvtuuhhmxn.jpg',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694855693/instaplus/storage/chat/65034f2698179f633a7870b1/ntrj0zsfxs5fm5ietgoq.jpg',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694855654/instaplus/storage/chat/65034f2698179f633a7870b1/ilpy9szx3bcbp7ogqdje.jpg',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694855597/instaplus/storage/chat/65034f2698179f633a7870b1/hsgeznw4idfyczv5ozh9.jpg',
    ]

    private static readonly messagePreviewPhotoUrls = [
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694707671/instaplus/storage/chat/64b3e50caf9cefccb764e6c7/q2vpddmm3j2uwj9pahni.jpg',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694707650/instaplus/storage/chat/64b3e50caf9cefccb764e6c7/sxp4xii6iys84e032yai.jpg',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694707585/instaplus/storage/chat/64b3e50caf9cefccb764e6c7/kl9cjq1jcyw6nzeleznv.jpg',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694855694/instaplus/storage/chat/65034f2698179f633a7870b1/yzpu01ujs2fdyg5yyoc1.jpg',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694855655/instaplus/storage/chat/65034f2698179f633a7870b1/tr1c5v3pux63z178a2cg.jpg',
        'https://res.cloudinary.com/dd3isrbpv/image/upload/v1694855599/instaplus/storage/chat/65034f2698179f633a7870b1/sjlccodh9v99g2aigaza.jpg',
    ]

    private static generateRandomUser(sex: 'male' | 'female'): Pick<IUser, 'firstName' | 'lastName' | 'username' | 'password'> {
        const firstName = faker.person.firstName(sex)
        const lastName = faker.person.lastName(sex)
        const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}`
        const password = faker.word.noun({ length: { min: 8, max: 12 } })
        return {
            firstName,
            lastName,
            username,
            password,
        }
    }

    private async generateRandomUsers(): Promise<Omit<IUser, 'password' | 'refreshToken'>[]> {
        const users: Pick<IUser, 'firstName' | 'lastName' | 'username' | 'password' | 'photoUrl'>[] = []

        const uniqueUsernames = new Map<string, boolean>()

        const genRandomUsers = (sex: 'male' | 'female', photoUrls: string[], length: number) => {
            let index = 0
            while (users.length < length) {
                const user = SeederService.generateRandomUser(sex)
                if (!uniqueUsernames.has(user.username)) {
                    uniqueUsernames.set(user.username, true)
                    users.push({
                        ...user,
                        photoUrl: photoUrls.length > 0 ? photoUrls[index] : null,
                    })
                    ++index
                }
            }
        }

        genRandomUsers('male', SeederService.maleAvatars, SeederService.maleAvatars.length)

        genRandomUsers('female', SeederService.femaleAvatars, SeederService.maleAvatars.length + SeederService.femaleAvatars.length)

        genRandomUsers('male', [], SeederService.maleAvatars.length + SeederService.femaleAvatars.length + 8)

        genRandomUsers('female', [], SeederService.maleAvatars.length + SeederService.femaleAvatars.length + 16)

        const dbUsers = await UserModel.insertMany(users.map(user => new UserModel(user)))

        return dbUsers.map(user => user.toObject())
    }

    private static getFullUser(user: Omit<IUser, 'password' | 'refreshToken'>): Pick<IUser, '_id' | 'firstName' | 'lastName' | 'username' | 'photoUrl'> {
        return {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            photoUrl: user.photoUrl,
        }
    }

    private static getShortUser(user: Omit<IUser, 'password' | 'refreshToken'>): Pick<IUser, '_id' | 'username' | 'photoUrl'> {
        return {
            _id: user._id,
            username: user.username,
            photoUrl: user.photoUrl,
        }
    }

    private async generateRandomFollowers(users: Omit<IUser, 'password' | 'refreshToken'>[]): Promise<void> {

        const combinations = this.combinationN<Omit<IUser, 'password' | 'refreshToken'>>(users, 2)
        let permutations: Omit<IUser, 'password' | 'refreshToken'>[][] = []

        for (const pair of combinations) {
            permutations.push([pair[0], pair[1]])
            permutations.push([pair[1], pair[0]])
        }

        permutations = _sampleSize(permutations, Math.floor(permutations.length / 5))

        await Promise.all(permutations.map((pair) => {
            return async () => {
                const followingUserId = pair[0]._id.toString()
                const followedUserId = pair[1]._id.toString()
                const createdAt = moment().subtract(_random(0, 256000), 'minutes').toDate()

                const follow = new FollowModel({
                    followingUserId,
                    followedUserId,
                    createdAt,
                })
                await follow.save()
                const notification = new FollowNotification({
                    type: 'follow',
                    userId: followedUserId,
                    user: SeederService.getShortUser(pair[0]),
                    createdAt,
                })
                await notification.save()
            }
        }))
    }

    private async generateRandomChats(users: Omit<IUser, 'password' | 'refreshToken'>[]): Promise<IChat[]> {
        const chats: {
            creator: Pick<IUser, '_id' | 'firstName' | 'lastName' | 'username' | 'photoUrl'>,
            chatMembers: Pick<IUser, '_id' | 'firstName' | 'lastName' | 'username' | 'photoUrl'>[]
        }[] = []

        const top5Users: Omit<IUser, 'password' | 'refreshToken'>[] = _sampleSize(users, 5)

        const generateOneToOneChats = () => {

            const top5UsersIds = top5Users.map(user => user._id.toString())

            const allUserCombinations = this.combinationN<Omit<IUser, 'password' | 'refreshToken'>>([
                ...top5Users,
                ...users.filter(user => !top5Users.some(top5User => top5User._id.toString() === user._id.toString())),
            ], 2)
            const top5UserCombinations: Omit<IUser, 'password' | 'refreshToken'>[][] = []

            for (const pair of allUserCombinations) {
                if (top5UsersIds.includes(pair[0]._id.toString()) || top5UsersIds.includes(pair[1]._id.toString())) {
                    top5UserCombinations.push(pair)
                }
            }

            let top5UserCombinationsMax35: Omit<IUser, 'password' | 'refreshToken'>[][] = []

            top5Users.forEach(user => {
                const findIndex = top5UserCombinations.findIndex(pair => pair[0]._id.toString() === user._id.toString())
                if (findIndex >= 0) {
                    top5UserCombinationsMax35 = [...top5UserCombinationsMax35, ...top5UserCombinations.slice(findIndex, findIndex + 35)]
                }
            })

            top5UserCombinationsMax35.forEach(pair => {
                chats.push({
                    creator: SeederService.getFullUser(pair[_random(0, 1)]),
                    chatMembers: [
                        SeederService.getFullUser(pair[0]),
                        SeederService.getFullUser(pair[1]),
                    ],
                })
            })
        }

        const generateGroupChats = () => {
            const combinations3 = this.combinationN<Omit<IUser, 'password' | 'refreshToken'>>(top5Users, 3)

            for (const pair of combinations3) {
                chats.push({
                    creator: SeederService.getFullUser(pair[_random(0, 2)]),
                    chatMembers: [
                        SeederService.getFullUser(pair[0]),
                        SeederService.getFullUser(pair[1]),
                        SeederService.getFullUser(pair[2]),
                    ],
                })
            }

            const combinations4 = this.combinationN<Omit<IUser, 'password' | 'refreshToken'>>(top5Users, 4)

            for (const pair of combinations4) {
                chats.push({
                    creator: SeederService.getFullUser(pair[_random(0, 3)]),
                    chatMembers: [
                        SeederService.getFullUser(pair[0]),
                        SeederService.getFullUser(pair[1]),
                        SeederService.getFullUser(pair[2]),
                        SeederService.getFullUser(pair[3]),
                    ],
                })
            }
        }

        generateOneToOneChats()

        generateGroupChats()

        const dbChats = await Promise.all(chats.map(chat => {
            const chatModel = new ChatModel(chat)
            return chatModel.save()
        }))

        return dbChats.map(chat => chat.toObject())
    }

    private async createMessage({
                                    chatId,
                                    creator,
                                    text = null,
                                    photoUrl = null,
                                    photoOrientation = null,
                                    previewPhotoUrl = null,
                                    reply = null,
                                    createdAt,
                                }: {
        chatId: string,
        creator: Pick<IUser, '_id' | 'username' | 'photoUrl'>,
        text?: string | null,
        photoUrl?: string | null,
        photoOrientation?: 'landscape' | 'portrait' | null,
        previewPhotoUrl?: string | null,
        reply?: Pick<IMessage, '_id' | 'creator' | 'text' | 'photoUrl' | 'photoOrientation' | 'previewPhotoUrl'> | null,
        createdAt: Date,
    }): Promise<IMessage> {
        const message = new MessageModel({
            chatId,
            creator,
            text,
            photoUrl,
            photoOrientation,
            previewPhotoUrl,
            reply,
            createdAt,
            seenByUserIds: [creator._id.toString()],
        })

        await message.save()

        return message.toObject()
    }

    private async generateRandomMessages(chats: IChat[], min: number, max: number): Promise<void> {
        const messages: Promise<IMessage>[] = []

        const getRandomCreator = (chat: IChat): Pick<IUser, '_id' | 'username' | 'photoUrl'> => {
            const creator = chat.chatMembers[_random(0, chat.chatMembers.length - 1) as number]
            return { _id: creator._id, username: creator.username, photoUrl: creator.photoUrl }
        }

        const generateReplyMessage = async (chat: IChat, index: number, total: number): Promise<IMessage> => {
            const createdAt = moment().subtract(_random(0, 86400), 'minutes')
            const creator = getRandomCreator(chat)
            const message = await this.createMessage({
                chatId: chat._id.toString(),
                text: faker.lorem.sentences({ min: 1, max: 4 }),
                creator,
                createdAt: createdAt.toDate(),
            })
            if (index > total - 3) {
                messages.push(this.createMessage({
                    chatId: chat._id.toString(),
                    text: faker.lorem.words({ min: 2, max: 5 }),
                    creator: chat.chatMembers[0]._id.toString() === creator._id.toString() ? {
                        _id: chat.chatMembers[1]._id,
                        username: chat.chatMembers[1].username,
                        photoUrl: chat.chatMembers[1].photoUrl,
                    } : {
                        _id: chat.chatMembers[0]._id,
                        username: chat.chatMembers[0].username,
                        photoUrl: chat.chatMembers[0].photoUrl,
                    },
                    reply: {
                        _id: message._id,
                        creator: message.creator,
                        text: message.text,
                        photoUrl: message.photoUrl,
                        photoOrientation: message.photoOrientation,
                        previewPhotoUrl: message.previewPhotoUrl,
                    },
                    createdAt: createdAt.clone().add(_random(20, 40), 'seconds').toDate(),
                }))
            }
            return message
        }

        chats.forEach(chat => {
            const total = _random(min, max)
            _range(total).forEach((index) => {
                messages.push(generateReplyMessage(chat, index, total))
            })
            if (_random(0, 1) > 0) {
                const photoIndices = _sampleSize(_range(SeederService.messagePhotoUrls.length), 2)
                messages.push(this.createMessage({
                    chatId: chat._id.toString(),
                    creator: getRandomCreator(chat),
                    photoUrl: SeederService.messagePhotoUrls[photoIndices[0]],
                    previewPhotoUrl: SeederService.messagePreviewPhotoUrls[photoIndices[0]],
                    photoOrientation: 'portrait',
                    createdAt: moment().subtract(_random(0, 86400), 'minutes').toDate(),
                }))
                if (_random(0, 1) > 0) {
                    messages.push(this.createMessage({
                        chatId: chat._id.toString(),
                        creator: getRandomCreator(chat),
                        photoUrl: SeederService.messagePhotoUrls[photoIndices[1]],
                        previewPhotoUrl: SeederService.messagePreviewPhotoUrls[photoIndices[1]],
                        photoOrientation: 'portrait',
                        createdAt: moment().subtract(_random(0, 86400), 'minutes').toDate(),
                    }))
                }
            }
        })

        await Promise.all(messages)
    }

    private* combinationN<T>(array: T[], n: number): Generator<T[]> {
        if (n === 1) {
            for (const a of array) {
                yield [a]
            }
            return
        }

        for (let i = 0; i <= array.length - n; i++) {
            for (const c of this.combinationN(array.slice(i + 1), n - 1)) {
                yield [array[i], ...c]
            }
        }
    }

    async seed(): Promise<void> {
        console.log('GENERATING RANDOM USERS...')

        const users = await this.generateRandomUsers()

        const chats = await this.generateRandomChats(users)

        console.log('GENERATING RANDOM USERS...DONE')
    }
}