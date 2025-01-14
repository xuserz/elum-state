import react from 'react';

interface Atom<T> {
    readonly key: string;
    readonly default?: T;
    readonly request?: (getter: () => T, setter: (v: SetStateAction<T>) => void) => void;
}
interface GlobalAtom<T> {
    readonly k: string;
    readonly d: T;
    readonly g: () => T;
    readonly s: (v: SetStateAction<T>) => void;
    readonly sb: (handle: react.Dispatch<T>) => void;
}
type SetStateAction<S> = S | ((prevState: S) => S | undefined) | undefined;
declare const atom: <T>(opt: Atom<T>) => GlobalAtom<T>;
declare const getter: <T>(atom: GlobalAtom<T>) => T;
declare const setter: <T>(atom: GlobalAtom<T>, v: SetStateAction<T>) => void;
declare const useGlobalValue: <T>(atom: GlobalAtom<T>) => T;
declare const useGlobalState: <T>(atom: GlobalAtom<T>) => [T, react.Dispatch<SetStateAction<T>>];

export { type Atom, type GlobalAtom, atom, getter, setter, useGlobalState, useGlobalValue };
