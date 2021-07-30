import React, { useEffect, useState } from "react";
import * as SecureStore from 'expo-secure-store';

export default function useSecureStore<T extends unknown>(key: string, initialState: T | undefined = undefined):
    [T | undefined, (value: T) => void, () => void] {

    const [state, setState] = useState<T | undefined>(initialState);

    useEffect(() => {
        SecureStore.getItemAsync(key).then(v => {
            if (v)
                setState(JSON.parse(v));
        });
    }, [])

    const clear = () => {
        SecureStore.deleteItemAsync(key);
        setState(undefined);
    }

    const setValue = (value: T) => {
        SecureStore.setItemAsync(key, JSON.stringify(value));
        setState(value);
    };

    return [state, setValue, clear];
}