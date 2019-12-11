import * as React from 'react'

export type MapboxStyle = {
    name: string;
    url: string;
    is3D?: boolean;
}

export const StylesContext = React.createContext<MapboxStyle[]>([])

export type StylesProviderProps = {
    styles: MapboxStyle[];
}

export default function StylesProvider(props: React.PropsWithChildren<StylesProviderProps>) {
    const { styles, children } = props;
    return <StylesContext.Provider value={styles}>
        {children}
    </StylesContext.Provider>
}