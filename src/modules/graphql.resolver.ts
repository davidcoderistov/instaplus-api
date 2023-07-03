import { ChatResolver } from './chat/chat.resolver'
import { UserResolver } from './user/user.resolver'

const graphqlResolver = [
    ChatResolver,
    UserResolver,
]

export default graphqlResolver