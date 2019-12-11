import { Point } from '@turf/turf';

export type OsmBaseElement = { id: number; type: string; tags: object };

export type NodeOsm = {
    lat: number;
    lon: number;
} & OsmBaseElement;

export type WayOsm = {
    nodes: number[];
} & OsmBaseElement;

export type OsmElement = NodeOsm | WayOsm;

export type DbBaseElement = { id?: number, osm_id?: number, tags: object }

export type NodeDb = {
    location: Point;
} & DbBaseElement;

export type WayDb = {
    nodes: NodeDb[];
} & DbBaseElement;