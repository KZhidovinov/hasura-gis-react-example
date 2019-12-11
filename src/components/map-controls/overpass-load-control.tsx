import * as mapboxgl from "mapbox-gl";
import * as React from 'react'
import { MapContext } from "react-mapbox-gl";

export type OverpassLoadOnClickFn = (map: mapboxgl.MapboxEvent) => void

export type OverpassLoadProps = {
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    onClick?: OverpassLoadOnClickFn;
}


export class OverpassLoadControl {
    map: mapboxgl.Map
    container: HTMLElement

    onAdd(map: mapboxgl.Map) {
        this.map = map
        this.container = document.createElement('div')
        this.container.className = 'mapboxgl-ctrl overpass-load-control noselect'
        this.container.innerText = 'Overpass API => DB'

        this.container.onclick = _ => this.map.fire('ovp.click', {})

        return this.container
    }

    onRemove(map: mapboxgl.Map) {
        this.container.onclick = undefined
        this.container.parentElement.removeChild(this.container)
        this.map = undefined
    }
}

export default function OverpassLoadComponent(props: OverpassLoadProps) {
    const map = React.useContext(MapContext)
    const [control] = React.useState(new OverpassLoadControl())

    React.useEffect(() => {
        const onClick = props.onClick || (() => { })

        map.addControl(control, props.position || "top-right")
        map.on('ovp.click', onClick)

        return () => {
            map.off('ovp.click', onClick)
        }
    }, [])

    return (null)
}