import PubSub from "pubsub-js";
import { nanoid } from "nanoid";
import createdeepclone from "rfdc";
import { useEffect, useState } from "react";

const deepclone = createdeepclone({
  circles: false,
  proto: true,
});

type Action<Type extends string, Payload> = {
  type: Type;
  payload: Payload;
};

type DefaultAction = Action<string, unknown>;

type Reducer<State, DispatchingAction extends DefaultAction> = (
  state: State,
  action: DispatchingAction
) => State;

type Dispatch<ActionType extends string, Payload extends unknown> = (
  action: Action<ActionType, Payload>
) => void;

const createReducer = <State, Action extends DefaultAction>(
  reducer: Reducer<State, Action>
) => reducer;

const basicStateReducer: Reducer<
  unknown,
  Action<"update", Partial<unknown>>
> = (state, action) => {
  if (action.type === "update") {
    const newState: unknown = {
      //@ts-ignore
      ...deepclone(state),
      //@ts-ignore
      ...deepclone(value),
    };
    return newState;
  }
  return state;
};

type PubSubStore<State, ActionType extends string, Payload extends unknown> = {
  dispatch: Dispatch<ActionType, Payload>;
  subscribe: (fn: (message: string) => void) => string;
  unsubscribe: (id: string) => string | boolean;
  getCurrentState: () => State;
};

const PubSubStoreClass = (() => {
  const wm = new WeakMap();
  class PubSubStore<State, ActionType extends string, Payload extends unknown> {
    constructor(
      initialState: State,
      reducer: Reducer<State, Action<ActionType, Payload>>
    ) {
      // const
      const pubId = nanoid();
      wm.set(this, { state: initialState, reducer, pubId });
    }
    dispatch(action: Action<ActionType, Payload>) {
      const all = <
        {
          state: State;
          reducer: Reducer<State, Action<ActionType, Payload>>;
          pubId: string;
        }
      >wm.get(this);
      const current = deepclone(all.reducer(all.state, action));
      wm.set(this, { ...all, state: current });
      PubSub.publish(all.pubId, null);
    }
    subscribe(fn: (message: string) => void) {
      const { pubId } = <
        {
          // state: State;
          // reducer: Reducer<State, Action<ActionType, Payload>>;
          pubId: string;
        }
      >wm.get(this);
      const id = PubSub.subscribe(pubId, fn);
      return id;
    }
    unsubscribe(id: string) {
      return PubSub.unsubscribe(id);
    }
    getCurrentState() {
      const { state } = <
        {
          state: State;
          // reducer: Reducer<State, Action<ActionType, Payload>>;
          // pubId: string;
        }
      >wm.get(this);
      return deepclone(state);
    }
  }

  return PubSubStore;
})();

// type PubSubStore = typeof PubSubStoreClass;

const createPubSubStore = <
  State,
  ActionType extends string,
  Payload extends unknown
>(
  initialState: State,
  reducer: Reducer<State, Action<ActionType, Payload>>
): PubSubStore<State, ActionType, Payload> => {
  const store = new PubSubStoreClass(initialState, reducer);
  /*let state__ = initialState;
  const pubId = nanoid();

  const getCurrentState = () => deepclone(state__);

  const setCurrentState = (newState: State) => {
    state__ = newState;
    PubSub.publish(pubId, null);
  };

  const dispatch: Dispatch<ActionType, Payload> = (action) => {
    const currentState = reducer(getCurrentState(), action);
    setCurrentState(deepclone(currentState));
  };

  const subscribe = (fn: (message: string) => void) => {
    const id = PubSub.subscribe(pubId, fn);
    return id;
  };

  const unsubscribe = (id: string) => {
    return PubSub.unsubscribe(id);
  };*/

  return store;
};

const usePubSubStore = <
  State,
  ActionType extends string,
  Payload extends unknown
>(
  store: PubSubStore<State, ActionType, Payload>
) => {
  const value = store.getCurrentState();
  const dispatch = store.dispatch;
  const setId = useState(nanoid())[1];

  useEffect(() => {
    const forceStateUpdate = () => {
      setId(nanoid());
    };
    const id = store.subscribe(forceStateUpdate);
    const cleanup = () => {
      store.unsubscribe(id);
    };
    return cleanup;
    // eslint-disable-next-line
  }, []);

  return [value, dispatch] as [typeof value, typeof dispatch];
};

const usePubSubSelector = <
  Selector extends keyof State,
  State,
  ActionType extends string,
  Payload extends unknown
>(
  selector: (state: State) => State[Selector],
  pubsubStore: PubSubStore<State, ActionType, Payload>
) => {
  const [value, setValue] = useState(() =>
    selector(pubsubStore.getCurrentState())
  );

  useEffect(() => {
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

// const customStore = createPubSubStore<StoreData, "update", Partial<StoreData>>(
//   testInit,
//   (state, action) => {
//     if (action.type === "update") {
//       return {...state, ...action.payload}
//     }
//     return state;
//   }
// );

const createBasicStore = <State>(initialValue: State) => {
  const store = createPubSubStore<State, "update", Partial<State>>(
    initialValue,
    //@ts-ignore
    basicStateReducer
  );
  return store;
};

export {
  createPubSubStore,
  usePubSubStore,
  usePubSubSelector,
  createReducer,
  createBasicStore,
};

// const store = createPubSubStore<{x:"123",y:number},"update", Partial<{x:string}>>({x:"123",y: 0}, (state, action) => state);

// const x = <{x:"123"}["x"]>usePubSubSelector((state) => state.y, store);
