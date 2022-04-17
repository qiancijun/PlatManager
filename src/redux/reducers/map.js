import { CREATE_MAP, ADD_MARKER, DELETE_MARKER, INIT_AMAP } from "../constant";

const map = {
    map: null,
    AMap: null,
    Loca: null,
    markers: new Map(),
}

export default function mapReducer(preState = map, action) {
    const { type, data } = action;
    switch (type) {
        case INIT_AMAP:
            preState.AMap = data.AMap;
            preState.Loca = data.Loca;
            return preState;
        case CREATE_MAP:
            preState.map = data.map;
            return preState;
        case ADD_MARKER:
            const { label, marker } = data;
            preState.markers.set(label, marker);
            return preState;
        case DELETE_MARKER:
            deleteMarker(preState, data);
            return preState;
        default:
            return preState;
    }
}

// 删除 marker
function deleteMarker(state, label) {
    const { markers } = state;
    markers.delete(label);
}