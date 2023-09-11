import { injectable } from 'inversify'
import { ISeederService } from './ISeeder.service'
import UserModel, { IUser } from '../../modules/user/db.models/user.model'
import bcrypt from 'bcrypt'
import { faker } from '@faker-js/faker'


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
    ]

    private static async generateRandomUser(sex: 'male' | 'female'): Promise<Pick<IUser, 'firstName' | 'lastName' | 'username' | 'password'>> {
        const firstName = faker.person.firstName(sex)
        const lastName = faker.person.lastName(sex)
        const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}`
        const password = await bcrypt.hash(faker.word.noun({ length: { min: 8, max: 12 } }), 10)
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

        const genRandomUsers = async (sex: 'male' | 'female', photoUrls: string[], length: number) => {
            let index = 0
            while (users.length < length) {
                const user = await SeederService.generateRandomUser(sex)
                if (!uniqueUsernames.has(user.username)) {
                    uniqueUsernames.set(user.username, true)
                    users.push({
                        ...user,
                        photoUrl: photoUrls[index],
                    })
                    ++index
                }
            }
        }

        await genRandomUsers('male', SeederService.maleAvatars, SeederService.maleAvatars.length)

        await genRandomUsers('female', SeederService.femaleAvatars, SeederService.maleAvatars.length + SeederService.femaleAvatars.length)

        const dbUsers = await Promise.all(users.map(user => {
            const userModel = new UserModel(user)
            return userModel.save()
        }))

        return dbUsers.map(user => user.toObject())
    }

    async seed(): Promise<void> {
        console.log('GENERATING RANDOM USERS...')

        const users = await this.generateRandomUsers()

        console.log('GENERATING RANDOM USERS...DONE')
    }
}