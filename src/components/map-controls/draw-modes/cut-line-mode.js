import { point, lineString, pointOnLine, lineSplit } from "@turf/turf";
import Constants from '@mapbox/mapbox-gl-draw/src/constants'

const CutLineMode = {
    onSetup: function (opts) {
        const state = {}
        return state;
    },

    onClick: function (state, e) {
        const features = this.featuresAt(e);

        // Take the first LineString
        const feature = features.find(f => f.geometry.type === Constants.geojsonTypes.LINE_STRING);
        if (!feature) return;

        const id = feature.properties.id;

        const actualFeature = this.getFeature(id);

        const line = lineString(actualFeature.coordinates);
        const cursorAt = point([e.lngLat.lng, e.lngLat.lat]);
        const snapped = pointOnLine(line, cursorAt);
        const featureCollection = lineSplit(line, snapped);

        this.deleteFeature(id);

        const newFeatures = featureCollection.features.map((f) => {
            f.properties = { ...actualFeature.properties };
            this.addFeature(this.newFeature(f));
            return f;
        });

        setTimeout(() => {
            this.map.fire(Constants.events.CREATE, {
                features: newFeatures
            });
        }, 10)

        this.changeMode(Constants.modes.SIMPLE_SELECT);
    },

    toDisplayFeatures: function (state, geojson, display) {
        display(geojson);
    },

    onMouseMove: function (state, e) {
        const features = this.featuresAt(e);
        this.map.getCanvas().style.cursor = features.length ? "crosshair" : "inherit";
    },

    onKeyUp: function (state, e) {
        console.log(e);
    },

    onStop: function (state) {
        this.map.getCanvas().style.cursor = 'inherit';
    }
}

export default CutLineMode;