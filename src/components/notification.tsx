import * as React from 'react'
import './notification.css'

export default function Notification(props: React.PropsWithChildren<any>) {
    return <div className={'notification-container'} >
        <div className={'notification'}>
            {props.children}
        </div>
    </div>
}