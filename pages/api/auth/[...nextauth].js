import NextAuth from "next-auth";
import SpotifyProvider from 'next-auth/providers/spotify'
import spotifyAPi, { LOGIN_URL } from "../../../lib/spotify";

async function refreshAccessToken(token) {
    try {

        spotifyAPi.setAccessToken(token.accessToken);
        spotifyAPi.setRefreshToken(token.refreshToken);

        const { body: refreshedToken } = await spotifyAPi.refreshAccessToken();
        
        return {
            ...token,
            accessToken: refreshedToken.access_token,
            accessTokenExpire: Date.now() + refreshedToken.expires_in * 1000,
            refreshToken: refreshedToken.refresh_token ?? token.refreshToken,
        }

    } catch (error) {
        return {
            ...token,
            error: 'refresh token error'
        }
    }

}

export default NextAuth({
    providers: [
        SpotifyProvider({
            clientId: process.env.SPOTIFY_ID,
            clientSecret: process.env.SPOTIFY_SECRET,
            authorization: LOGIN_URL,
        })
    ],
    secret: process.env.JWT_SECRET,
    pages: {
        signIn: '/login'
    },
    callbacks: {
        async jwt({ token, account, user }) {

            if(account && user) {
                return {
                    ...token,
                    accessToken: account.access_token,
                    refreshToken: account.refresh_token,
                    username: account.providerAccountId,
                    accessTokenExpire: account.expires_at * 1000
                }
            }

            if(Date.now() < token.accessTokenExpire) {
                return token;
            }

            return await refreshAccessToken(token)
        },

        async session({ token, session }) {
            session.user.accessToken = token.accessToken;
            session.user.refreshToken = token.refreshToken;
            session.user.username = token.username;

            return session;
        }
    }
});