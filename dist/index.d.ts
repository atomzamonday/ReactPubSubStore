declare type Action<Type extends string, Payload> = {
    type: Type;
    payload: Payload;
};
declare type DefaultAction = Action<string, unknown>;
declare type Reducer<State, DispatchingAction extends DefaultAction> = (state: State, action: DispatchingAction) => State;
declare type Dispatch<ActionType extends string, Payload extends unknown> = (action: Action<ActionType, Payload>) => void;
declare const createReducer: <State, Action_1 extends DefaultAction>(reducer: Reducer<State, Action_1>) => Reducer<State, Action_1>;
declare type PubSubStore<State, ActionType extends string, Payload extends unknown> = {
    dispatch: Dispatch<ActionType, Payload>;
    subscribe: (fn: (message: string) => void) => string;
    unsubscribe: (id: string) => string | boolean;
    getCurrentState: () => State;
};
declare const createPubSubStore: <State, ActionType extends string, Payload extends unknown>(initialState: State, reducer: Reducer<State, Action<ActionType, Payload>>) => PubSubStore<State, ActionType, Payload>;
declare const usePubSubStore: <State, ActionType extends string, Payload extends unknown>(store: PubSubStore<State, ActionType, Payload>) => [State, Dispatch<ActionType, Payload>];
declare const usePubSubSelector: <Selector extends keyof State, State, ActionType extends string, Payload extends unknown>(selector: (state: State) => State[Selector], pubsubStore: PubSubStore<State, ActionType, Payload>) => State[Selector];
declare const createBasicStore: <State>(initialValue: State) => PubSubStore<State, "update", Partial<State>>;
export { createPubSubStore, usePubSubStore, usePubSubSelector, createReducer, createBasicStore, };
//# sourceMappingURL=index.d.ts.map