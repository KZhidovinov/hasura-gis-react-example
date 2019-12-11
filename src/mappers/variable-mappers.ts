import { WayDb } from "../models";
import { Feature, LineString } from "@turf/turf";

export type WayDbMapper = (w: WayDb) => any;

export const parseDbId = (featureId: string | number) => {
    const splitted = featureId.toString().split('#')
    if (splitted.length != 2)
        return undefined

    return parseInt(splitted[1])
}

export const mapWayDbToParam: WayDbMapper = (way: WayDb) => ({
    osm_id: way.osm_id,
    tags: way.tags || {},
    way_nodes: {
        data: way.nodes.map((node, idx) => ({
            node: {
                data: node,
                on_conflict: {
                    constraint: 'node_osm_id_key',
                    update_columns: ['location', 'tags']
                }
            },
            way_idx: idx
        })),
        on_conflict: {
            constraint: 'way_node_pkey',
            update_columns: ['role', 'way_idx']
        }
    }
});

export const mapWayFeatureToUpdateParam = (feature: Feature<LineString>) => {
    const { id, properties: { node_ids: existingNodeIds, tags, ...props }, geometry: { coordinates } } = feature

    // use empty node ids for local nodes
    const node_ids = existingNodeIds || coordinates.map((_) => null)

    const nodes = node_ids.map((node_id, idx) => {
        if (node_id) {
            return {
                id: node_id,
                location: {
                    type: 'Point',
                    coordinates: coordinates[idx]
                }
            }
        } else {
            return { tags: {}, location: { type: 'Point', coordinates: coordinates[idx] } }
        }
    })

    return {
        id: parseDbId(id),
        ...props,
        tags: tags || {},
        way_nodes: {
            data: node_ids.map((_, idx) => ({
                node: {
                    data: nodes[idx],
                    on_conflict: {
                        constraint: 'node_pkey',
                        update_columns: ['location', 'tags']
                    }
                },
                way_idx: idx
            })),
        }
    }
}

export const mapWayFeatureToDbId = (feature: Feature) => parseDbId(feature.id)