import React, { PureComponent } from 'react'
import "./index.scss"
import { APP_NAME } from "../../config.js"

function Topbar() {
    return (
        <div className="topbar-container">
            <div className="-app-name">{ APP_NAME }</div>
            <div className="-main-page">总览</div>
            <div className="-about">关于</div>
        </div>
    )
}

export default Topbar
