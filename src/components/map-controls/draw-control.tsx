import * as MapboxDraw from "@mapbox/mapbox-gl-draw"
import * as turf from '@turf/turf'
import * as React from 'react'
import { MapContext } from "react-mapbox-gl"
import direct_select from './draw-modes/direct-select-advanced'
import { FeatureContext } from "../feature-store-provider"

const DRAW_CONTROL_OPTIONS = {
    displayControlsDefault: false,
    controls: {
        line_string: true,
        point: true,
        trash: true
    },
    modes: {
        ...MapboxDraw.modes,
        direct_select
    }
}

export type DrawProps = {
    features?: turf.Feature[];
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    onSelectionChange?: (f: turf.Feature[]) => void;
    canEdit?: boolean;
}

export default function DrawControl(props: DrawProps) {
    const { position, features, onSelectionChange, canEdit } = props

    const [drawControl] = React.useState(new MapboxDraw(DRAW_CONTROL_OPTIONS))
    const store = React.useContext(FeatureContext)
    const map = React.useContext(MapContext)

    React.useEffect(() => {
        if (drawControl) {
            drawControl.options.controls = canEdit ? DRAW_CONTROL_OPTIONS.controls : {}
        }

        map.addControl(drawControl, position || 'top-right')

        const onDrawCreate = async (event) => store.insertWays(event.features)

        const onDrawUpdate = async (event) => store.updateWays(event.features)

        const onDrawDelete = async (event) => {
            onSelectionChange?.call(null, [])
            store.deleteWays(event.features)
        }
        const onDrawSelectionchange = async (event) => onSelectionChange?.call(null, event.features)

        map.on('draw.create', onDrawCreate)
        map.on('draw.update', onDrawUpdate)
        map.on('draw.delete', onDrawDelete)
        map.on('draw.selectionchange', onDrawSelectionchange)

        return () => {
            map.off('draw.create', onDrawCreate)
            map.off('draw.update', onDrawUpdate)
            map.off('draw.delete', onDrawDelete)
            map.off('draw.selectionchange', onDrawSelectionchange)
            map.removeControl(drawControl)
        }
    }, [canEdit])

    React.useEffect(() => {
        drawControl?.set(turf.featureCollection(features || []))
    }, [features])

    return <><div></div></>
}