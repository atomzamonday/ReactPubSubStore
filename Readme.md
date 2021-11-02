# React Pubsub Store

Multi stores for React.

## Basic usage

```tsx
import {
  createPubSubStore,
  usePubSubStore, // global selector
  usePubSubSelector, // partial selector
  createBasicStore, // like useState.
} from "atomsf-react-pubsub-store";

type Data = {
  username: string;
  password: string;
};

const store = createPubSubStore<Data, "update" | "reset", Partial<Data>>(
  initialState,
  (state, action) => {
    if (action.type === "update") {
      return { ...state, ...action.payload };
    }
    if (action.type === "reset") {
      return initialState;
    }
    return state;
  }
);

// Rerender within all depencies changed. [username, password]
const InputOne: React.FC = () => {
  const [state, dispatch] = usePubSubStore<Data, "update", Partial<Data>>(store);

  return (
    <input
      value={state.username}
      onChange={(e) => {
        dispatch({
          type: "update",
          payload: {
            username: e.target.value,
          },
        });
      }}
    />
  );
};

// Rerender within only password changed (Recommended).
const InputTwo: React.FC = () => {
  const [password, dispatch] = usePubSubSelector<Data, "update", Partial<Data>>(
    (state) => state.password,
    store
  );

  return (
    <input
      type="password"
      value={password}
      onChange={(e) => {
        dispatch({
          type: "update",
          payload: {
            password: e.target.value,
          },
        });
      }}
    />
  );
};
```

by AtomSanfrance.
