import * as React from 'react'
import { StylesContext } from '../styles-provider'
import './mapbox-style-select.css'

export type MapboxStyleSelectProps = {
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

export default function MapboxStyleSelect(props: MapboxStyleSelectProps) {
    const { onChange } = props
    const styles = React.useContext(StylesContext)

    return <select className={'mapbox-style-select'} onChange={onChange} >
        {styles.map(({ name, url }) =>
            <option key={name} value={url}>{name}</option>
        )}
    </select>
}