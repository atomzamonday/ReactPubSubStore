"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBasicStore = exports.createReducer = exports.usePubSubSelector = exports.usePubSubStore = exports.createPubSubStore = void 0;
const pubsub_js_1 = __importDefault(require("pubsub-js"));
const nanoid_1 = require("nanoid");
const rfdc_1 = __importDefault(require("rfdc"));
const react_1 = require("react");
const deepclone = (0, rfdc_1.default)({
    circles: false,
    proto: true,
});
const createReducer = (reducer) => reducer;
exports.createReducer = createReducer;
const basicStateReducer = (state, action) => {
    if (action.type === "update") {
        const newState = {
            //@ts-ignore
            ...deepclone(state),
            //@ts-ignore
            ...deepclone(value),
        };
        return newState;
    }
    return state;
};
const createPubSubStore = (initialState, reducer) => {
    let state__ = initialState;
    const pubId = (0, nanoid_1.nanoid)();
    const getCurrentState = () => state__;
    const setCurrentState = (newState) => {
        state__ = newState;
        pubsub_js_1.default.publish(pubId, null);
    };
    const dispatch = (action) => {
        setCurrentState(reducer(getCurrentState(), action));
    };
    const subscribe = (fn) => {
        const id = pubsub_js_1.default.subscribe(pubId, fn);
        return id;
    };
    const unsubscribe = (id) => {
        return pubsub_js_1.default.unsubscribe(id);
    };
    return {
        dispatch,
        subscribe,
        unsubscribe,
        getCurrentState,
    };
};
exports.createPubSubStore = createPubSubStore;
const usePubSubStore = (store) => {
    const value = store.getCurrentState();
    const dispatch = store.dispatch;
    const setId = (0, react_1.useState)((0, nanoid_1.nanoid)())[1];
    (0, react_1.useEffect)(() => {
        const forceStateUpdate = () => {
            setId((0, nanoid_1.nanoid)());
        };
        const id = store.subscribe(forceStateUpdate);
        const cleanup = () => {
            store.unsubscribe(id);
        };
        return cleanup;
        // eslint-disable-next-line
    }, []);
    return [value, dispatch];
};
exports.usePubSubStore = usePubSubStore;
const usePubSubSelector = (selector, pubsubStore) => {
    const [value, setValue] = (0, react_1.useState)(() => selector(pubsubStore.getCurrentState()));
    (0, react_1.useEffect)(() => {
        const forceStateUpdate = () => {
            setValue(selector(pubsubStore.getCurrentState()));
        };
        const id = pubsubStore.subscribe(forceStateUpdate);
        const cleanup = () => {
            pubsubStore.unsubscribe(id);
        };
        return cleanup;
        // eslint-disable-next-line
    }, []);
    return value;
};
exports.usePubSubSelector = usePubSubSelector;
// const customStore = createPubSubStore<StoreData, "update", Partial<StoreData>>(
//   testInit,
//   (state, action) => {
//     if (action.type === "update") {
//       return {...state, ...action.payload}
//     }
//     return state;
//   }
// );
const createBasicStore = (initialValue) => {
    const store = createPubSubStore(initialValue, 
    //@ts-ignore
    basicStateReducer);
    return store;
};
exports.createBasicStore = createBasicStore;
// const store = createPubSubStore<{x:"123",y:number},"update", Partial<{x:string}>>({x:"123",y: 0}, (state, action) => state);
// const x = <{x:"123"}["x"]>usePubSubSelector((state) => state.y, store);
