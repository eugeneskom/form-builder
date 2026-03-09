export const typeDefs = /* GraphQL */ `
  enum FieldType {
    text
    number
    textarea
  }

  type FieldOptions {
    label: String
    placeholder: String
    required: Boolean
    minLength: Int
    maxLength: Int
    min: Float
    max: Float
    step: Float
    rows: Int
  }

  input FieldOptionsInput {
    label: String
    placeholder: String
    required: Boolean
    minLength: Int
    maxLength: Int
    min: Float
    max: Float
    step: Float
    rows: Int
  }

  type Field {
    id: ID!
    type: String!
    order: Int!
    options: FieldOptions!
  }

  type Form {
    id: ID!
    title: String!
    description: String
    published: Boolean!
    fields: [Field!]!
    createdAt: String!
    updatedAt: String!
  }

  type Submission {
    id: ID!
    formId: String!
    data: String!
    createdAt: String!
  }

  type Query {
    forms: [Form!]!
    publishedForms: [Form!]!
    form(id: ID!): Form
  }

  type Mutation {
    createForm(title: String!, description: String): Form!
    updateForm(id: ID!, title: String, description: String, published: Boolean): Form!
    deleteForm(id: ID!): Boolean!

    addField(formId: ID!, type: String!, options: FieldOptionsInput!): Field!
    updateField(id: ID!, type: String, order: Int, options: FieldOptionsInput): Field!
    deleteField(id: ID!): Boolean!
    reorderFields(formId: ID!, fieldIds: [ID!]!): [Field!]!

    submitForm(formId: ID!, data: String!): Submission!
  }
`;
