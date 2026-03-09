import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { createYoga } from 'graphql-yoga';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { typeDefs } from '~/graphql/schema';
import { resolvers } from '~/graphql/resolvers';

const schema = makeExecutableSchema({ typeDefs, resolvers });

const yoga = createYoga({
  schema,
  graphqlEndpoint: '/api/graphql',
  fetchAPI: { Request, Response },
});

export async function loader({ request }: LoaderFunctionArgs) {
  return yoga.fetch(request);
}

export async function action({ request }: ActionFunctionArgs) {
  return yoga.fetch(request);
}
