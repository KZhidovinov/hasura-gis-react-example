import * as turf from '@turf/turf';

export const mapWayNodeToFeature = ({
    node: {
        __typename,
        id,
        location
    }
}) => {
    // removed crs property because of mapbox-gl error
    const { coordinates } = location;
    return turf.point(coordinates,
        {},
        {
            id: [__typename, id].join('#')
        })
}

export const mapWayToFeature = ({
    __typename,
    id,
    tags,
    way_nodes_aggregate: { nodes }
}) => {
    const coordinates = nodes.map(({ node: { location: { coordinates } } }) => coordinates)
    const node_ids = nodes.map(({ node: { id } }) => id)
    return turf.lineString(coordinates,
        {
            node_ids,
            tags
        },
        {
            id: [__typename, id].join('#')
        })
}

export async function mapWaysToFeatures(ways: any[]) {
    const chunkSize = 200;
    const result = []

    for (let i = 0, len = ways.length; i < len; i += chunkSize) {
        const chunk = ways.slice(i, i + chunkSize)
        Array.prototype.push.apply(result, chunk.map(mapWayToFeature))
        
        // allow to switch to other function to prevent UI freezes
        await new Promise(res => setTimeout(res, 10))
        // console.log(`${i} chunks done`)
    }

    return result
}

type FeatureArrayCallback = (features: turf.Feature[]) => void

export function processWaysByExtentResponse(data: any, onChunkReady: FeatureArrayCallback, onComplete: () => void, chunkSize: number = 100) {
    const ways = data.way as any[];
    if (!ways) return;

    const waysLength = ways.length;

    let i = 0;
    const doChunk = () => {
        const chunk = ways.slice(i, i + chunkSize);
        const features: turf.Feature[] = [];

        chunk.forEach(way => {
            const featurePoints = way.way_nodes_aggregate.nodes.map(mapWayNodeToFeature)

            // append way nodes
            Array.prototype.push.apply(features, featurePoints)

            // append way
            features.push(mapWayToFeature(way))
        });

        onChunkReady && onChunkReady.call(null, features);

        i += chunkSize;
        if (i < waysLength) {
            setTimeout(doChunk, 1)
        } else {
            onComplete && onComplete.call(null)
        }
    }

    doChunk();
}