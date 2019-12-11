import { BBox, bbox, Polygon } from '@turf/turf';
import { NodeDb, NodeOsm, OsmElement, WayDb, WayOsm } from '../models';

export const OVERPASS_API_URL = 'https://overpass.openstreetmap.ru/cgi/interpreter';

export const OVERPASS_RAILWAY_TRAM_QUERY_FUNC = ([a, b, c, d]: BBox) => `
[out:json][bbox:${[b, a, d, c].join(',')}];
way[railway=tram]->.ways;
(node(w.ways);.ways;);
out body;
`;


export class OverpassApiLoader {
    nodeCache = new Map<number, NodeDb>();
    wayCache = new Map<number, WayDb>();

    loadRailway = async (extent: Polygon) => {
        const resp = await fetch(OVERPASS_API_URL, {
            method: 'POST',
            body: `data=${encodeURIComponent(OVERPASS_RAILWAY_TRAM_QUERY_FUNC(bbox(extent)))}`,
            mode: 'cors',
            cache: 'no-cache'
        });

        const data = await resp.json();

        this.processResponse(data);

        return {
            ways: this.wayCache,
            nodes: this.nodeCache
        };
    };

    processResponse = (data) => {
        if (data.elements.length == 0) {
            throw Error('Response data is empty')
        }

        data.elements.forEach(element => this.processElement(element));
    };

    mapNodeToDb = (node: NodeOsm) => ({
        osm_id: node.id,
        location: { type: 'Point', coordinates: [node.lon, node.lat] },
        tags: node.tags || {}
    } as NodeDb);

    mapWayToDb = (way: WayOsm) => ({
        osm_id: way.id,
        nodes: way.nodes.map(node_id => this.nodeCache.get(node_id)),
        tags: way.tags
    } as WayDb);

    processElement = (element: OsmElement) => {
        switch (element.type) {
            case 'node':
                const node = this.mapNodeToDb(element as NodeOsm);
                this.nodeCache.set(node.osm_id, node);
                break;
            case 'way':
                const way = this.mapWayToDb(element as WayOsm);
                this.wayCache.set(way.osm_id, way);
                break;
            default:
                throw new Error(`Unknown value of element.type: ${element.type}`)
        }
    };
}