const config = {
    secureKeys: {
        accessToken: 'teste.accesstoken',
        userInfo: 'teste.userinfo'
    },
    identityServerUrl: 'https://login.alienlab.com.br',
    identityServerOptions: {
        clientId: 'interactive.public',
        scopes: ['openid', 'profile', 'email', 'api', 'offline_access'],
    },
    identityServerUseProxy: false,
}

export default config;