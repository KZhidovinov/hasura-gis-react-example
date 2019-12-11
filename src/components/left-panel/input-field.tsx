import * as React from 'react'

export type InputFieldProps = {
    value?: string;
    editable?: boolean;
    onOpenEditor?: () => void;
    onCloseEditor?: () => void;
    onChange?: (val: string) => void;
}

const EMPTY_TEXT = "<<empty>>"

export default function InputField(props: InputFieldProps) {
    const { editable, value, onChange, onCloseEditor, onOpenEditor } = props
    const [isEdit, setIsEdit] = React.useState(false)
    const inputRef = React.useRef<HTMLInputElement>()

    const onInputChange = React.useCallback((e) => onChange?.call(null, e.target.value), [onChange])
    const onInputBlur = React.useCallback((e) => {
        onCloseEditor?.call(null)
        setIsEdit(false)
    }, [setIsEdit, onCloseEditor])

    const onSpanClick = React.useCallback(e => {
        if (!editable) return

        onOpenEditor?.call(null)
        setIsEdit(true)
    }, [setIsEdit, editable])


    const onInputKeyUp = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        // closing editor on [enter] or [esc]
        if (e.keyCode == 13 || e.keyCode == 27) {
            onInputBlur.call(null)
        }
    }, [onInputBlur])

    React.useEffect(() => {
        inputRef.current?.focus()
    })

    return (isEdit
        ? <input value={value || ""} style={{ width: '70px' }}
            ref={inputRef}
            onChange={onInputChange}
            onBlur={onInputBlur}
            onKeyUp={onInputKeyUp}
        />
        : <span onClick={onSpanClick}>
            {value || EMPTY_TEXT}
        </span>)

}