import * as React from 'react'
import './view-as-select.css'
import { TEST_TOKENS } from '../../auth'

export type ViewAsSelectProps = {
    value: string | null;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function ViewAsSelect(props: ViewAsSelectProps) {
    const { onChange, value } = props

    return <div className={'view-as-select'}>
        <label htmlFor={'view-as'}>View as: </label>
        <select id={'view-as'} onChange={onChange} value={value} >
            {TEST_TOKENS.map(({ name, token }) =>
                <option key={name} value={token}>{name}</option>
            )}
        </select>
    </div>
}