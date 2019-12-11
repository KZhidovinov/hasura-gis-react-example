import { Feature, LineString, Polygon } from "@turf/turf";
import ApolloClient from "apollo-client";
import { Subscription } from "apollo-client/util/Observable";
import { mapWayToFeature } from '../mappers/response-mappers';
import { mapWayDbToParam, mapWayFeatureToDbId, mapWayFeatureToUpdateParam } from "../mappers/variable-mappers";
import { WayDb } from "../models";

export const getWaysInExtent = require('../graphql/get-ways-in-extent.gql')
const subscribeToWaysInExtent = require('../graphql/subscribe-to-ways-in-extent.gql')
const insertOsmWays = require('../graphql/insert-osm-ways.gql')
const insertWays = require('../graphql/insert-ways.gql')
const updateWays = require('../graphql/update-ways.gql')
const deleteWays = require('../graphql/delete-ways.gql')
const setWayTags = require('../graphql/set-way-tags.gql')
const deleteWayTag = require('../graphql/delete-way-tag.gql')

export default class FeatureStoreWrapper {
    private client: ApolloClient<any>
    private subscription: Subscription;

    constructor(client: ApolloClient<any>) {
        this.client = client
    }

    async insertOsmWays(ways: Map<number, WayDb>) {
        const objects = Array.from(ways.values(), mapWayDbToParam)
        const osm_ids = Array.from(ways.keys())
        return await this.client.mutate({
            mutation: insertOsmWays,
            variables: { objects, osm_ids }
        })
    }

    async insertWays(features: Feature[]) {
        const objects = features.map(mapWayFeatureToUpdateParam)

        return await this.client.mutate({
            mutation: insertWays,
            variables: { objects }
        })
    }

    async updateWays(features: Feature[]) {
        const objects = features.map(mapWayFeatureToUpdateParam)
        const ids = features.map(mapWayFeatureToDbId)

        return await this.client.mutate({
            mutation: updateWays,
            variables: { objects, ids }
        })
    }

    async deleteWays(features: Feature[]) {
        const ids = features.map(mapWayFeatureToDbId)
        return await this.client.mutate({
            mutation: deleteWays,
            variables: { ids }
        })
    }

    async setWayTags(features: Feature[], tags: any) {
        const ids = features.map(mapWayFeatureToDbId)
        return await this.client.mutate({
            mutation: setWayTags,
            variables: { ids, tags }
        })
    }

    async deleteWayTag(features: Feature[], tag_key: string) {
        const ids = features.map(mapWayFeatureToDbId)
        return await this.client.mutate({
            mutation: deleteWayTag,
            variables: { ids, tag_key }
        })
    }

    subscribeToWaysInExtent(extent: Polygon, callback: (ways: Feature<LineString>[]) => void) {
        const wkt_extent = `POLYGON((${extent.coordinates[0].map(([lng, lat]) => [lng, lat].join(' ')).join(',')}))`

        if (this.subscription) {
            this.unsubscribeWaysInExtent()
        }

        this.subscription = this.client.subscribe({
            query: subscribeToWaysInExtent,
            variables: { wkt_extent }
        }).subscribe({ next: ({ data: { get_ways_in_extent: ways } }) => callback(ways.map(mapWayToFeature)) })
    }

    unsubscribeWaysInExtent() {
        this.subscription.unsubscribe()
        this.subscription = null
    }
}