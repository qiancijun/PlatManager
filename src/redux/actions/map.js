import { CREATE_MAP, ADD_MARKER, DELETE_MARKER, INIT_AMAP } from "../constant";

export const createMapAction = data => ({type: CREATE_MAP, data});
export const addMarkerAction = data => ({type: ADD_MARKER, data});
export const deleteMarkerAction = data => ({type: DELETE_MARKER, data});
export const initAmapAction = data => ({type: INIT_AMAP, data});