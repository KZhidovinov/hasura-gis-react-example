import * as turf from '@turf/turf'
import * as React from 'react'

import './left-panel.css'
import AttributesPanel from './attributes-panel'

export type LeftPanelProps = {
    features?: turf.Feature[];
    onSelectionChange?: (features: turf.Feature[]) => void
}

export default function LeftPanel(props: LeftPanelProps) {
    const { features } = props
    const [selectedFeatures, setSelectedFeatures] = React.useState(features)

    React.useEffect(() => setSelectedFeatures(features.length == 1 ? features : []), [features])

    return <div className={`left-panel ${features.length == 0 ? 'hidden' : ''}`}>
        <h2>Selected objects:</h2>
        <ul>
            {
                features.map(feature => {
                    const { id } = feature
                    const onClick = (e) => {
                        e.preventDefault()
                        setSelectedFeatures([feature])
                    }

                    return <li key={id}><a href='#' onClick={onClick}>{id}</a></li>
                })
            }
        </ul>

        {selectedFeatures.length == 1 && <AttributesPanel feature={selectedFeatures[0]} />}
    </div>
}
