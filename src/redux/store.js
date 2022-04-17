import {createStore,applyMiddleware,combineReducers} from 'redux'
import thunk from 'redux-thunk'

import mapReducer from './reducers/map'
const allReducer = combineReducers({
    mapState: mapReducer,
})

export default createStore(allReducer,applyMiddleware(thunk))