const { ApolloServer, gql } = require('apollo-server');
const models = require('./models');

const typeDefs = gql`
  interface Character {
    id: ID!
    name: String!
  }

  type User implements Character {
    id: ID!
    name: String!
    email: String!
    status: UserStatus
  }

  type Author implements Character {
    id: ID!
    name: String!
    Books: [Book]
  }

  type Book {
    id: ID!
    title: String
    Author: Author
  }

  enum ColorType {
    RED
    BLUE
    GREEN
  }

  enum UserStatus {
    ACTIVE
    DELETED
    INVITED
  }

  type DuongDep {
    name: String!
    kiet: String!
  }

  type Query {
    hello: String
    getUsers(limit: Int, status: UserStatus): [User]
    getUser(id: Int!): User
    setFavouriteColor(color: ColorType): String
    hero: [Character]
    getAuthors: [Author]
    getFirstUser: User
    getBook(id: Int): Book
    getDuongDep: DuongDep
  }

  input UserInput {
    name: String
    email: String
    status: UserStatus
  }

  type UserOutPut {
    name: String
    email: String
  }

  type Mutation {
    createUser(name: String!, email: String!, status: UserStatus): UserOutPut!
    createAuthor(name: String!): Author!
    createBook(title: String!, authorId: Int!): Book!
    createUserObject(params: UserInput): UserOutPut
  }
`;

const resolvers = {
  Character: {
    __resolveType(obj, context, info) {
      if (obj.email) {
        return 'User';
      }
      if (obj.Books) {
        return 'Author';
      }
      return null;
    },
  },
  Query: {
    hello: () => 'hello from apollo-server',
    getUsers: (root, args, context, info) => {
      const { limit, status } = args;
      return models.User.findAll({
        where: {
          status: status,
        },
        limit: limit,
      });
    },
    getUser: (root, args, context, info) => {
      const { id } = args;
      return models.User.findByPk(id);
    },
    setFavouriteColor: (root, args, context, info) => {
      return 'Your Favorite Color is :' + args.color;
    },
    hero: () => {
      return models.Author.findAll({
        include: {
          model: models.Book,
        },
      });
    },
    getAuthors: (root, args, context, info) => {
      return models.Author.findAll({
        include: {
          model: models.Book,
        },
      });
    },
    getFirstUser: (root, args, context, info) => {
      return models.User.findOne({
        order: [['createdAt', 'ASC']],
      });
    },
    getBook: (root, args, context, info) => {
      const { id } = args;
      return models.Book.findByPk(id, {
        include: {
          model: models.Author,
        },
      });
    },
    getDuongDep: (root, args, context, info) => {
      return {
        name: 'Duong',
        kiet: 'Kiet dep hon Duong'
      }
    },
  },
  Mutation: {
    createUserObject: (root, args, context, info) => {
      console.log(args)
      return models.User.create(args.params);
    },
    createUser: (root, args, context, info) => {
      const { name, email, status } = args;

      models.User.create({
        name: name,
        email: email,
        status: status,
      });

      return;
    },
    createAuthor: (root, args, context, info) => {
      const { name } = args;
      return models.Author.create({
        name: name,
      });
    },
    createBook: (root, args, context, info) => {
      const { title, authorId } = args;
      return models.Book.create({
        title: title,
        AuthorId: authorId,
      });
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers, tracing: true, context: { models } });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
