import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import * as turf from '@turf/turf'
import { throttle } from 'lodash'
import * as mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import * as React from 'react'
import ReactMapboxGl from 'react-mapbox-gl'
import { OverpassApiLoader } from '../integration/overpass-api-loader'
import { mapWaysToFeatures } from '../mappers/response-mappers'
import { WayDb } from '../models'
import { FeatureContext, useLazyQueryFeatures } from './feature-store-provider'
import LeftPanel from './left-panel'
import { DrawControl, FullscreenControl, MapboxStyleSelect, NavigationControl, OverpassLoadControl, ScaleControl } from "./map-controls"
import './map.css'
import Notification from './notification'
import { StylesContext } from './styles-provider'
import ViewAsSelect from './map-controls/view-as-select'
import { getAuthToken, setAuthToken, clearAuthToken, has_edit_geometry_rights } from '../auth'

const MAX_BOUNDS = new mapboxgl.LngLatBounds([[29.5929988781, 59.5648572059], [30.9388240735, 60.2397292614]])

const FEATURES_ON_SCREEN_LIMIT = 200
const MIN_ZOOM = 12

export type MapProps = {
}

const MapboxMap = ReactMapboxGl({
    accessToken: null,
    hash: true
})

const getCurrentExtent = (map: mapboxgl.Map) => {
    const [[s, w], [n, e]] = map.getBounds().toArray()
    return turf.getGeom(turf.bboxPolygon([s, w, n, e]))
}

export default function Map(props: MapProps) {
    const styles = React.useContext(StylesContext)
    const store = React.useContext(FeatureContext)

    const [styleUrl, setStyleUrl] = React.useState(styles[0].url)
    const onStyleChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) =>
        setStyleUrl(e.target.value), [setStyleUrl])

    const [queryFeatures] = useLazyQueryFeatures({
        onCompleted: async (data) => setFeatures(await mapWaysToFeatures(data.way))
    })

    const [features, setFeatures] = React.useState<turf.Feature[]>([])
    const [zoom, setZoom] = React.useState<number>()
    const [selectedFeatures, setSelectedFeatures] = React.useState<turf.Feature[]>([])

    // console.log(`Features on screen: ${features.length}`)

    const showFeatures = React.useCallback((map: mapboxgl.Map) => {
        const zoom = map.getZoom()
        setZoom(zoom)
        if (zoom < MIN_ZOOM) {
            return
        }

        const extent = getCurrentExtent(map)
        queryFeatures({ variables: { extent } })

        store.subscribeToWaysInExtent(extent, setFeatures)
    }, [queryFeatures, store, setFeatures])

    const onMapLoad = React.useCallback((map: mapboxgl.Map) => {
        showFeatures(map)
    }, [showFeatures, queryFeatures, store, setFeatures])

    const onMoveEnd = React.useCallback(
        throttle((map: mapboxgl.Map) =>
            showFeatures(map), 1000),
        [showFeatures, queryFeatures, store, setFeatures]
    )

    const onOverpassLoadClick = React.useCallback((event: mapboxgl.MapboxEvent) => {
        const extent = getCurrentExtent(event.target)
        new OverpassApiLoader()
            .loadRailway(extent)
            .then(({ ways }) => store.insertOsmWays(ways as Map<number, WayDb>))
            .catch(err => console.warn(err));
    }, [])

    const [authToken, setToken] = React.useState(getAuthToken())
    const onViewAsSelectChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const newToken = e.target.value
        if (newToken === authToken)
            return;

        if (newToken) {
            setAuthToken(newToken)
            location.reload()
        } else {
            clearAuthToken()
        }
        setToken(newToken)
    }, [setToken, authToken])

    return <MapboxMap style={styleUrl}
        className={'mapContainer'}
        containerStyle={{
            height: '100vh',
            width: '100vw'
        }}
        maxBounds={MAX_BOUNDS}
        onStyleLoad={onMapLoad}
        onMoveEnd={onMoveEnd}
    >
        <MapboxStyleSelect onChange={onStyleChange} />
        <ViewAsSelect onChange={onViewAsSelectChange} value={authToken} />
        <LeftPanel features={selectedFeatures} onSelectionChange={setSelectedFeatures} />
        <FullscreenControl />
        <NavigationControl showZoom={true} showCompass={true} visualizePitch={true} />
        <ScaleControl position={'bottom-right'} maxWidth={150} />
        <OverpassLoadControl onClick={onOverpassLoadClick} />
        {
            zoom < MIN_ZOOM
                ? <Notification>Map extent is too big! Please zoom in to see objects!</Notification>
                : features.length > FEATURES_ON_SCREEN_LIMIT
                    ? <Notification>Object count is too big! Please zoom in to see objects.</Notification>
                    : <DrawControl
                        canEdit={has_edit_geometry_rights(authToken)}
                        position={'top-right'}
                        features={features}
                        onSelectionChange={setSelectedFeatures}
                    />
        }
    </MapboxMap>
}