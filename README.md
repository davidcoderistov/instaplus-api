<p align="center">
  <img alt="Tech Stack" src="https://skillicons.dev/icons?i=nodejs,mongodb,express,graphql,apollo,docker,aws&perline=7" />
</p>

## Core Features

Instaplus API offers a range of core features designed to provide a seamless and engaging user experience:

- **JWT Authentication:** Utilizes [access and refresh tokens](https://jwt.io/) for secure user authentication.

- **Recommendation Engine:** Suggests users and posts through a [collaborative filtering algorithm](https://en.wikipedia.org/wiki/Collaborative_filtering), enhancing content discovery.

- **Real-time Messaging:** Implements instant messaging using web sockets and [GraphQL subscriptions](https://www.npmjs.com/package/graphql-subscriptions) for timely updates.

- **Efficient Query Caching:** Optimizes performance by caching query results using [Dataloader](https://github.com/graphql/dataloader).

- **Cloudinary Integration:** Leverages [Cloudinary](https://cloudinary.com/) cloud storage for media management and storage.

- **Inversify Inversion of Control (IoC) Container:** Employs the [Inversify](https://www.npmjs.com/package/inversify) IoC container for flexible and efficient dependency management.
  
- **Docker Containerization:** Streamlines deployment and ensures consistent environments across various stages of development and production using [Docker](https://www.docker.com/).
  
- **AWS EC2 Deployment:** Hosted on [Amazon Web Services (AWS) Elastic Compute Cloud (EC2)](https://aws.amazon.com/ec2/) instances for scalability and reliability.

## Three-Layer Architecture Pattern
- **Repository Layer:** Responsible for handling data storage and retrieval. It encapsulates the database interactions, abstracting away the underlying data storage technology. Each module within the API has its own repository, ensuring a clear separation of concerns.
- **Service Layer:** Acts as the business logic layer, orchestrating the operations performed on data. It serves as the intermediary between the repository and resolver layers, facilitating data transformation, validation, and other core functionalities.
- **Resolver Layer:** Forms the outermost layer, serving as the entry point for GraphQL queries and mutations. It maps GraphQL operations to specific service methods, allowing for efficient and flexible request handling. The resolver layer also handles input validation, authentication, and response formatting.

##### Chat Module Folder Structure Example
```
+---db.models
|       chat.model.ts
|       message.model.ts
|       user-deleted-chat.model.ts
+---dtos
|       add-chat-members.dto.ts
|       create-chat.dto.ts
|       create-message.dto.ts
|       find-chats.dto.ts
|       find-messages-by-chat-id.dto.ts
|       index.ts
|       react-to-message.dto.ts
+---graphql.models
|       chat-with-latest-message.model.ts
|       chat.model.ts
|       chats-with-latest-message.model.ts
|       index.ts
|       message.model.ts
|       messages.model.ts
|       reaction.model.ts
|       unread-messages-count.model.ts
+---interfaces
        IChat.repository.ts
        IChat.service.ts
|   chat.repository.ts
|   chat.service.ts
|   chat.resolver.ts
```


