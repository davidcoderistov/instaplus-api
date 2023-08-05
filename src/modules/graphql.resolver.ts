import { ChatResolver } from './chat/chat.resolver'
import { UserResolver } from './user/user.resolver'
import { NotificationResolver } from './notification/notification.resolver'
import { SearchHistoryResolver } from './search-history/search-history.resolver'
import { PostResolver } from './post/post.resolver'

const graphqlResolver = [
    ChatResolver,
    UserResolver,
    NotificationResolver,
    SearchHistoryResolver,
    PostResolver,
]

export default graphqlResolver