import { createContext } from 'react';
import * as AuthSession from 'expo-auth-session';

export type AuthContextData = {
    token?: AuthSession.TokenResponse;
    userInfo?: Record<string, any>;
    login: () => void;
    logout: () => void;
    teste: () => void;
}

const AuthContext = createContext({} as AuthContextData)

export default AuthContext;