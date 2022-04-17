import React from 'react'
import Topbar from './components/Topbar'
import Footnote from './components/Footnote'
import "./index.scss"
import MainPage from './pages/MainPage'
import LocalPage from './pages/LocalPage'
import ModalPage from './pages/ModalPage'
import DataPage from './pages/DataPage'
import { Route, Switch } from 'react-router-dom'

export default function App() {

  return (
    <>
      <Topbar />
      <div className="router-panel">
        <Switch>
          <Route path="/loca" component={LocalPage} />
          <Route path="/modal" component={ModalPage}/>
          <Route path="/data" component={DataPage}/>
          <Route path="/" component={MainPage} />
        </Switch>
      </div>
      <Footnote />
    </>
  )
}
