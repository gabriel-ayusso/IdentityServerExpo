import React, { useEffect } from "react";
import { useState } from "react";
import AuthContext from "./AuthContext";
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import config from "../../config";
import useSecureStore from "../hooks/useSecureStore";
import usePersistentState from "../hooks/usePersistentState";

const redirectUri = AuthSession.makeRedirectUri({ useProxy: config.identityServerUseProxy });
const openIdOptions = { ...config.identityServerOptions, redirectUri };

WebBrowser.maybeCompleteAuthSession();

export default function AuthProvider(props: any) {
    const [token, setToken, clearToken] = useSecureStore<AuthSession.TokenResponse | undefined>(config.secureKeys.accessToken);
    const [userInfo, setUserInfo, clearUserInfo] = usePersistentState<Record<string, any> | undefined>(config.secureKeys.userInfo);
    const discovery = AuthSession.useAutoDiscovery('https://demo.identityserver.io');
    const [request, result, promptAsync] = AuthSession.useAuthRequest(openIdOptions, discovery);

    useEffect(() => console.log('==> request', request), [request]);
    useEffect(() => console.log('==> result', result), [result]);

    /**
     * Porque assim que faz o login, ele retorna o `code`, que deve ser trocado 
     * pelo access_token. O método exchangeCodeAsync faz exatamente isso, troca
     * o code pelo access code 
     */
    const _handleCodeExchange = (arg: AuthSession.AuthSessionResult) => {
        // verifico antes para não precisar tratar o arg abaixo (pq senão ele pode 
        // ficar como undefined) 
        if (arg.type === 'success') {
            //console.log('>>>> promptAsync success ', arg);
            const code = arg.params.code;
            const param = {
                code,
                ...openIdOptions,
                extraParams: {
                    code_verifier: request?.codeVerifier || "",
                }
            }

            // verifico o discovery para ele não ficar undefined
            if (discovery) {
                AuthSession.exchangeCodeAsync(param, discovery)
                    .then(r2 => {
                        //console.log('>>>> exchange Success', r2);
                        setToken(r2);
                        _loadUserInfo(r2.accessToken);
                    })
                    .catch(e2 => console.log('>>>> exchange Error', e2));
            }
        } else {
            console.log('>>>> _handleCodeExchange Error - arg is not success', arg);
        }
    }

    /**
     * Obtém os dados do usuário (perfil)
     * Temos pelo demo.identityserver as opções:
     * email, email_verified, family_name, given_name, name, sub, e website
     */
    const _loadUserInfo = (_t?: string) => {
        if (discovery) {
            AuthSession.fetchUserInfoAsync({ accessToken: _t || token?.accessToken || '' }, discovery)
                .then(u => {
                    console.log('>>>> _loadUserInfo', u);
                    setUserInfo(u);
                })
                .catch(e => console.log('>>>> _loadUserInfo Error', e))
        } else {
            console.log('>>>> _loadUserInfo error - token or discovery are null');
        }
    }

    /**
     * Efetua o login, e obtém o code. Assim que ele é retornado com sucesso, ele repassa
     * para o handleCodeExchange que troca o code pelo access_token.
     */
    const login = () => {
        if (discovery) {
            promptAsync({ useProxy: config.identityServerUseProxy })
                .then(_handleCodeExchange)
                .catch(e => console.log('>>>> promptAsync Error: ', e))
        } else {
            console.log('>>>> login error - discovery is null');
        }
    }

    const logout = () => {
        console.log('=> logout', result, request)

        if (discovery && token) {
            const url = `${discovery.endSessionEndpoint}?id_token_hint=${token.accessToken}`;
            clearUserInfo();
            clearToken();
            request?.promptAsync(discovery, { url });
        } else {
            console.log('>>>> logout error - discovery or token are null');
        }
    }

    return (
        <AuthContext.Provider value={{ token, userInfo, login, logout, teste: _loadUserInfo }}>
            {props.children}
        </AuthContext.Provider>
    );
}