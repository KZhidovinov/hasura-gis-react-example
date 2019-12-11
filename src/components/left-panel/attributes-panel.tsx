import * as turf from '@turf/turf'
import * as React from 'react'
import AttributesItem, { AttributesItemEvent } from './attributes-item'
import { FeatureContext } from '../feature-store-provider'


export type AttributesPanelProps = {
    feature: turf.Feature
}

export default function AttributesPanel(props) {
    const { feature } = props

    const [attributes, setAttributes] = React.useState({})

    const store = React.useContext(FeatureContext)

    React.useEffect(() => {
        const attrs = mapFeatureToAttributes(feature)

        setAttributes(attrs)
    }, [feature, setAttributes])

    const onItemChange = React.useCallback(async (e: AttributesItemEvent) => {
        const { ...newAttrs } = attributes

        switch (e.action) {
            case 'delete':
                delete newAttrs[e.key]
                await store.deleteWayTag([feature], e.key)
                break
            case 'set':
                newAttrs[e.key] = e.value
                await store.setWayTags([feature], newAttrs)
                break
            default:
                throw new Error('Unknown AttributesItemEvent action')
        }

        setAttributes(newAttrs)
    }, [attributes, setAttributes, store])

    return <div>
        <table>
            <thead>
                <tr><td colSpan={3}><h3>Attributes ({feature.id}):</h3></td></tr>
            </thead>
            <tbody>
                {
                    Object.entries(attributes).map(([key, value]) =>
                        <AttributesItem key={[feature.id, key, value].join('#')}
                            name={key}
                            value={value.toString()}
                            onChange={onItemChange}
                        />
                    )
                }
                <AttributesItem key={`${feature.id}#new`} isNew onChange={onItemChange} />
            </tbody>
        </table>
    </div>
}


const mapFeatureToAttributes = (feature: any) => {
    const { id, properties: { tags } } = feature
    return { id, ...tags }
}
