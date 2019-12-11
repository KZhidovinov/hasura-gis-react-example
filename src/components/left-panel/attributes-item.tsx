import * as React from 'react'
import InputField from './input-field'
import { has_edit_properties_rights, getAuthToken } from '../../auth'

export type AttributesItemEvent = {
    action: 'set' | 'delete',
    key: string,
    value: string
}

export type AttributesItemProps = {
    isNew?: boolean;
    name?: string;
    value?: string;
    onChange?: (e: AttributesItemEvent) => void;
}

export default function AttributesItem(props: AttributesItemProps) {
    const { name, value, isNew, onChange } = props
    const [state, setState] = React.useState<any>({ name, value })

    const isNameEditable = isNew
    const isValueEditable = has_edit_properties_rights(getAuthToken()) && (!state.name || state.name != 'id')

    const onCloseEditor = React.useCallback((state) => {
        const { name, value } = state
        if (name && value) {
            if (value != props.value) {
                onChange?.call(null, { action: 'set', key: name, value })
            }

            if (isNew) {
                setState({})
            }
        } else {
            setState({ ...state, name })
        }

    }, [onChange, isNew, setState])

    const onNameChange = React.useCallback((name: string) =>
        setState({ ...state, name }), [state, setState])
    const onValueChange = React.useCallback((value: string) =>
        setState({ ...state, value }), [state, setState])

    const onDeleteClick = React.useCallback(e => onChange?.call(null, { action: 'delete', key: name }), [name, onChange])

    return <tr>
        <td key={"name"}>
            <InputField value={state.name} editable={isNameEditable} onCloseEditor={() => onCloseEditor(state)} onChange={onNameChange} />
        </td>
        <td key={"value"}>
            <InputField value={state.value} editable={isValueEditable} onCloseEditor={() => onCloseEditor(state)} onChange={onValueChange} />
        </td>
        <td>{
            isValueEditable && !isNew && <button onClick={onDeleteClick} >X</button>
        }</td>
    </tr>
}