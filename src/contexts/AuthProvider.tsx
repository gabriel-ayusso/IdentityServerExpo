import React from "react";
import { useState } from "react";
import AuthContext from "./AuthContext";
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import config from "../../config";

const redirectUri = AuthSession.makeRedirectUri({ useProxy: config.identityServerUseProxy });
const openIdOptions = { ...config.identityServerOptions, redirectUri };

WebBrowser.maybeCompleteAuthSession();

export default function AuthProvider(props: any) {
    const [token, setToken] = useState<AuthSession.TokenResponse>();
    const [tokenState, setTokenState] = useState<string>();
    const [userInfo, setUserInfo] = useState<Record<string, any>>();
    const discovery = AuthSession.useAutoDiscovery('https://demo.identityserver.io');
    const [request, result, promptAsync] = AuthSession.useAuthRequest(openIdOptions, discovery);

    /**
     * Porque assim que faz o login, ele retorna o `code`, que deve ser trocado 
     * pelo access_token. O método exchangeCodeAsync faz exatamente isso, troca
     * o code pelo access code 
     */
    const _handleCodeExchange = (arg: AuthSession.AuthSessionResult) => {
        if(arg.type === 'success')
            setTokenState(arg.params.state);
        // verifico antes para não precisar tratar o arg abaixo (pq senão ele pode 
        // ficar como undefined) 
        if (arg.type === 'success') {
            console.log('>>>> promptAsync success ', arg);
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
                        console.log('>>>> exchange Success', r2);
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
            request?.promptAsync(discovery, { useProxy: config.identityServerUseProxy })
                .then(_handleCodeExchange)
                .catch(e => console.log('>>>> promptAsync Error: ', e))
        } else {
            console.log('>>>> login error - discovery is null');
        }
    }

    const logout = () => {
        let state = token?.state;

        if (discovery && token) {
            const url = `${discovery.endSessionEndpoint}?id_token_hint=${token.accessToken}&post_logout_redirect_uri=${redirectUri}&state=${state}`
            WebBrowser.openAuthSessionAsync(`${discovery.endSessionEndpoint}?id_token_hint=${token.accessToken}` ?? '', redirectUri)
                .then(r2 => {
                    console.log('>>>> openAuthSessionAsync success', r2);
                    setToken(undefined);
                    setUserInfo(undefined);
                })
                .catch(e => console.log('>>>> openAuthSessionAsync error', e))
            // AuthSession.revokeAsync({ token: token?.accessToken }, discovery)
            //     .then(r => {
            //         console.log('>>>> logoff success - ', r);
            //         setToken(undefined);
            //         setUserInfo(undefined);
            //     })
            //     .catch(e => console.log('>>>> promptAsync Error: ', e))
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