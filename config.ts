const config = {
    identityServerUrl: 'https://demo.identityserver.io',
    identityServerOptions: {
        clientId: 'interactive.public',
        scopes: ['openid', 'profile', 'email', 'api', 'offline_access'],
    },
    identityServerUseProxy: false,
}

export default config;