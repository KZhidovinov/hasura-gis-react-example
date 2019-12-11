import * as React from 'react'
import { ApolloProvider } from 'react-apollo'
import { client } from '../apollo'
import Map from './map'
import FeatureStoreProvider from './feature-store-provider'
import StylesProvider from './styles-provider'

const styles = [
    { "name": "KlokanTech Basic RU", "url": "https://your-tiles-domain.com/styles/klokantech-basic-ru/style.json" },
    { "name": "KlokanTech Basic RU 3D", "url": "https://your-tiles-domain.com/styles/klokantech-basic-ru-3d/style.json" },
    { "name": "KlokanTech Basic", "url": "https://your-tiles-domain.com/styles/klokantech-basic/style.json" },
    { "name": "KlokanTech Basic 3D", "url": "https://your-tiles-domain.com/styles/klokantech-basic-3d/style.json" }
]

export default function RootComponent(props) {
    return <>
        <ApolloProvider client={client}>
            <FeatureStoreProvider>
                <StylesProvider styles={styles}>
                    <Map />
                </StylesProvider>
            </FeatureStoreProvider>
        </ApolloProvider>
    </>
}
