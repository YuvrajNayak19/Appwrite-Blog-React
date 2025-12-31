import { data } from 'react-router-dom';
import conf from '../conf/conf.js'
import { Client, Account, ID } from "appwrite"

export class AuthService{
    client = new Client();
    account;
    
    constructor(){
            this.client
                .setEndpoint(conf.appwriteUrl)
                .setProject(conf.appwriteProjectId);
            this.account = new Account(this.client);
    }

    async createAccount(email, password, name){
        try{
            const userAccount = await this.account.create(ID.unique(), email, password, name)
            if(userAccount){
                return this.login(email, password);
            }else{
                return userAccount;
            }
        }catch(error){
            console.log('Appwrite createAccount error:', error);
            throw error;
        }
    }
    async login(email, password){
         try{
            const session = await this.account.createEmailPasswordSession(email, password);
            return session;
         }catch(error){
            console.log('Appwrite login error:', error);
            const msg = String((error && (error.message || error.$message)) || error || '');
            if (msg.includes('Email / Password authentication is disabled') || msg.includes('Email/Password authentication is disabled')) {
                throw new Error('Email/Password authentication is disabled in your Appwrite project. Enable it in the Appwrite Console → Settings → Authentication → Providers.');
            }
            if (msg.includes('Unauthorized') || (error && error.code === 401)) {
                throw new Error('Login failed: Unauthorized. Check credentials, Allowed Origins, and that cookies/credentials are enabled.');
            }
            throw error;
         }
    }
    async getCurrentUser() {
  try {
    return await this.account.get();
  } catch (error) {
    if (error?.code === 401) {
      return null;
    }
    console.error("Appwrite getCurrentUser error:", error);
    return null;
  }
}

    async logout(){
      try{
            return await this.account.deleteSessions();
        }catch(error){
            console.log('Appwrite service :: logout ::', error)
        }
    }
    async testAccountFetchWithCredentials(){
        try{
            const url = `${conf.appwriteUrl}/account`;
            const res = await fetch(url, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'X-Appwrite-Project': String(conf.appwriteProjectId),
                    'Accept': 'application/json'
                }
            });
            try{
                const body = await res.clone().json();
            }catch(e){
                const text = await res.text();
            }
            return res;
        }catch(error){
            throw error;
        }
    }

    async checkConnectivity({ fetchHealth = true, fetchAccount = true } = {}) {
        const result = {
            ok: false,
            health: null,
            account: null,
        };
        async function safeFetch(url, opts = {}) {
            try {
                const res = await fetch(url, opts);
                const out = { status: res.status, ok: res.ok };
                try {
                    out.body = await res.clone().json();
                } catch (e) {
                    out.text = await res.text();
                }
                return out;
            } catch (e) {
                return { error: String(e) };
            }
        }
        const baseRaw = String(conf.appwriteUrl || '').replace(/\/$/, '');
        const base = baseRaw.replace(/\/v1$/, '');
        if (fetchHealth) {
            const healthPaths = ['/v1/health', '/health'];
            let healthResult = null;
            for (const p of healthPaths) {
                const url = `${base}${p}`;
                const r = await safeFetch(url, {
                    method: 'GET',
                    headers: { 'X-Appwrite-Project': String(conf.appwriteProjectId), 'Accept': 'application/json' },
                });
                if (r && typeof r === 'object') r._url = url;
                healthResult = r;
                if (r && typeof r.status === 'number' && r.status !== 404) break;
            }
            result.health = healthResult;
        }

        if (fetchAccount) {
            const accountPaths = ['/v1/account', '/account'];
            let accountResult = null;
            for (const p of accountPaths) {
                const url = `${base}${p}`;
                const r = await safeFetch(url, {
                    method: 'GET',
                    credentials: 'include',
                    headers: { 'X-Appwrite-Project': String(conf.appwriteProjectId), 'Accept': 'application/json' },
                });
                if (r && typeof r === 'object') r._url = url;
                accountResult = r;
                // prefer any result that's not a 404 (not found)
                if (r && typeof r.status === 'number' && r.status !== 404) break;
            }
            result.account = accountResult;
            if (result.account && result.account.status === 401) {
                console.warn('Appwrite account fetch returned 401: session cookie not sent or invalid. Check Allowed Origins, CORS credentials, and verify you have an active session (login).');
                console.info('Hint: Ensure your dev origin (including port) is listed under Allowed Origins in Appwrite Console and that credentials are allowed; also confirm VITE_APPWRITE_PROJECT_ID matches the project.');
            } else if (result.account && result.account.status === 403) {
                console.warn('Appwrite account fetch returned 403: project key or permission issue.');
            } else if (result.account && result.account.status >= 500) {
                console.warn('Appwrite account fetch returned server error:', result.account.status);
            }
        }

        result.ok = Boolean(
            (result.health && result.health.ok) ||
            (result.account && result.account.ok)
        );
         return result;
    }
    async isConnected() {
        const r = await this.checkConnectivity();
        return Boolean(r.ok);
    }
}

const authService = new AuthService(); 


export default authService;