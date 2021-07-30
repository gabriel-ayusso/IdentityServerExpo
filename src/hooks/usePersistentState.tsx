import React, { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function usePersistentState<T extends unknown>(key: string, initialState: T | undefined = undefined):
    [T | undefined, (value: T) => void, () => void] {

    const [state, setState] = useState<T | undefined>(initialState);

    useEffect(() => {
        AsyncStorage.getItem(key).then(v => {
            if (v)
                setState(JSON.parse(v));
        });
    }, [])

    const clear = () => {
        AsyncStorage.removeItem(key).then();
        setState(undefined);
    }

    const setValue = (value: T) => {
        AsyncStorage.setItem(key, JSON.stringify(value)).then();
        setState(value);
    };

    return [state, setValue, clear];
}