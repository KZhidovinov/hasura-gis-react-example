import * as mapboxgl from 'mapbox-gl';
import * as React from 'react'
import { MapContext } from "react-mapbox-gl";
import drawControl from './draw-control'
import overpassLoadControl from './overpass-load-control'
import mapboxStyleSelect from './mapbox-style-select'

export function createReactComponent<T extends mapboxgl.Control>(type: new (options: any) => T) {
    return function (props) {
        const { position, ...opts } = props
        const control = new type(opts)
        const map = React.useContext(MapContext)
        React.useEffect(() => {
            map.addControl(control, position)
            return () => {
                map.removeControl(control)
            }
        }, [])
        return (null)
    }
}

export const FullscreenControl = createReactComponent(mapboxgl.FullscreenControl)
export const NavigationControl = createReactComponent(mapboxgl.NavigationControl)
export const ScaleControl = createReactComponent(mapboxgl.ScaleControl)

export const DrawControl = drawControl
export const OverpassLoadControl = overpassLoadControl
export const MapboxStyleSelect = mapboxStyleSelect