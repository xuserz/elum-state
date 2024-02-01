import react from "react";

type EventType = string | symbol;
type EventHandler<T> = (event: T) => void;
type EventhList<T> = Array<EventHandler<T>>;
type EventhMap<Events extends Record<EventType, unknown>> = Map<keyof Events, EventhList<Events[keyof Events]>>;

interface Atom<T> {
  readonly key: string;
  readonly default?: T;
  readonly request?: (getter: () => T, setter: (v: SetStateAction<T>) => void) => void;
};

interface GlobalAtom<T> {
  readonly k: string;
  readonly d: T;
  readonly g: () => T;
  readonly s: (v: SetStateAction<T>) => void;
  readonly sb: (handle: react.Dispatch<T>) => void;
}

type SetStateAction<S> = S | ((prevState: S) => S | undefined) | undefined;

const events = <Events extends Record<EventType, unknown>>(
  map: EventhMap<Events> = new Map()
) => ({
  on: <Key extends keyof Events>(
    key: Key,
    dispatch: EventHandler<Events[keyof Events]>,
    dispatchList: EventhList<Events[keyof Events]> | undefined = map.get(key)) =>
    dispatchList ? dispatchList.push(dispatch) : map.set(key, [dispatch]),
  off: <Key extends keyof Events>(
    key: Key,
    dispatch: EventHandler<Events[keyof Events]>,
    dispatchList: EventhList<Events[keyof Events]> | undefined = map.get(key)) =>
    dispatchList && dispatch ? dispatchList.splice(dispatchList.indexOf(dispatch) >>> 0, 1) : map.set(key, []),
  emit: <Key extends keyof Events>(
    key: Key,
    value: Events[Key],
    dispatchList: EventhList<Events[keyof Events]> = map.get(key) || []) => {
    for (const dispatch of dispatchList) { dispatch(value) }
  }
}),
  context = {
    m: new Map<string, any>(),
    l: new Map<string, boolean>(),
    e: events<Record<string, any>>()
  },
  atom = <T>(opt: Atom<T>): GlobalAtom<T> => {
    const { key } = opt;
    const s = (v: SetStateAction<T>) => {
      const value = typeof v === "function" ? (v as Function)(g()) : v;
      context.m.set(key, value); context.l.set(key, true); context.e.emit(key, value);
    }
    const g = () => {
      if (opt.request && context.l.get(key) !== false) { context.l.set(key, false); opt.request(g, s); }
      return context.m.get(key) ?? opt.default
    }
    return {
      k: key,
      d: opt.default as T,
      g,
      s,
      sb: (value) => {
        context.e.on(key, value);
        return () => context.e.off(key, value);
      }
    }
  },
  getter = <T>(atom: GlobalAtom<T>): T => atom.g(),
  setter = <T>(atom: GlobalAtom<T>, v: SetStateAction<T>) => atom.s(v),
  useGlobalValue = <T>(atom: GlobalAtom<T>): T => {
    const [v, dispatch] = react.useState(getter(atom));
    react.useLayoutEffect(() => atom.sb(dispatch), []);
    return v;
  },
  useGlobalState = <T>(atom: GlobalAtom<T>): [T, react.Dispatch<SetStateAction<T>>] =>
    [useGlobalValue(atom), (v: SetStateAction<T>) => setter(atom, v)]

export {
  atom,
  getter,
  setter,
  useGlobalValue,
  useGlobalState,
  GlobalAtom,
  Atom,
}
