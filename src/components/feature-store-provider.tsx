import React = require("react");
import { useApolloClient, useLazyQuery } from "react-apollo";
import FeatureStoreWrapper, { getWaysInExtent } from "../store/feature-store-wrapper";

export const FeatureContext = React.createContext<FeatureStoreWrapper>(null)

export default function FeatureStoreProvider(props) {
    const { children } = props
    const client = useApolloClient()
    const [featureStoreWrapper] = React.useState(new FeatureStoreWrapper(client))

    return <FeatureContext.Provider value={featureStoreWrapper}>
        {children}
    </FeatureContext.Provider>
}

export function useLazyQueryFeatures(options?: any) {
    const client = useApolloClient()
    return useLazyQuery(getWaysInExtent, {
        client,
        fetchPolicy: "cache-first",
        ...options
    })
}