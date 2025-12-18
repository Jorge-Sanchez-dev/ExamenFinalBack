import { gql } from "apollo-server";



export const typeDefs = gql`

    type User {
        _id: ID!
        email: String!
        clothes: [Clothing]!
    }

    type Clothing {
        _id: ID!
        name: String!
        size: String!
        color: String!
        price: Float!
    }

    type Query {
        me: User
        clothes(page: Int, size: Int): [Clothing]!
        clothing(id: ID!): Clothing
    }

    type Mutation {
        addClothing(name: String!, size: String!, color: String!, price: Float!): Clothing!
        buyClothing(clothingId: ID!): User!
        returnClothing(clothingId: ID!): User
        updateClothing(clothingId: ID! name: String size: String color: String price: Float): Clothing
        deleteClothing(clothingId: ID!): Boolean!
        register(email: String!, password: String!): String!
        login(email: String!, password: String!): String!
    }
`