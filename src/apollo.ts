import ApolloClient from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { InMemoryCache, defaultDataIdFromObject } from "apollo-cache-inmemory";
import { WebSocketLink } from "apollo-link-ws";
import { split } from "apollo-link";
import { getMainDefinition } from "apollo-utilities";
import { SubscriptionClient } from "subscriptions-transport-ws";
import { setContext } from 'apollo-link-context';
import { getAuthHeaders } from "./auth";

const scheme = (proto) => {
    return window.location.protocol == 'https:' ? `${proto}s` : proto;
};

const HASURA_GRAPHQL_ENGINE_HOSTNAME = process.env.HASURA_GRAPHQL_ENGINE_HOSTNAME;
export const GRAPHQL_ENDPOINT = `${scheme('http')}://${HASURA_GRAPHQL_ENGINE_HOSTNAME}/v1/graphql`;
export const WEBSOCKET_ENDPOINT = `${scheme('ws')}://${HASURA_GRAPHQL_ENGINE_HOSTNAME}/v1/graphql`;

const authLink = setContext((_, { headers }) => ({
    headers: {
        ...headers,
        ...getAuthHeaders(),
    }
}));

const httpLink = new HttpLink({ uri: GRAPHQL_ENDPOINT });

const wsLink = new WebSocketLink(
    new SubscriptionClient(WEBSOCKET_ENDPOINT, {
        reconnect: true,
        connectionParams: {
            headers: { ...getAuthHeaders() }
        }
    })
);

const link = split(
    // split based on operation type
    ({ query }) => {
        const definition = getMainDefinition(query);
        return definition.kind == 'OperationDefinition' && definition.operation == 'subscription';
    },
    wsLink,
    authLink.concat(httpLink)
);

export const client = new ApolloClient({
    link,
    cache: new InMemoryCache({
        addTypename: true,
        dataIdFromObject: obj => {
            switch (obj.__typename) {
                case 'way':
                case 'node':
                    return `${obj.__typename}#${obj.id}`
                case 'way_node':
                    return `wn#${obj['way_id']}#${obj['node_id']}`
                default:
                    return defaultDataIdFromObject(obj)
            }
        }
    })
});