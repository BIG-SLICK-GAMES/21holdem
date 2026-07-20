import axios from "axios";
import { removeToken } from "../src/helper/helper";
import { getCookie, ReactToastify } from "shared/utils";

function isLocalHostname(hostname = "") {
    return ["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(String(hostname).toLowerCase());
}

function getBrowserHostname() {
    if (typeof window === "undefined") return "";
    return window.location?.hostname || "";
}

function getBrowserApiOriginForLocalEndpoint(parsedUrl) {
    if (typeof window === "undefined") return "";

    const browserHostname = getBrowserHostname();
    if (!browserHostname) return "";

    if (process.env.NODE_ENV === "development") {
        const port = parsedUrl.port || "4000";
        return `${window.location.protocol}//${browserHostname}:${port}`;
    }

    return window.location.origin || "";
}

function stripApiSuffix(url = "") {
    return String(url || "").replace(/\/api\/v1\/?$/i, "").replace(/\/api\/?$/i, "").replace(/\/$/, "");
}

function isValidApiEndpoint(url) {
    if (typeof url !== "string" || !url.trim()) return false;

    try {
        const parsedUrl = new URL(url);
        return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
    } catch {
        return false;
    }
}

export function getApiRoot(url = process.env.REACT_APP_API_ENDPOINT) {
    const configuredUrl = isValidApiEndpoint(url) ? url : "";

    if (!configuredUrl) return "";

    const browserHostname = getBrowserHostname();

    try {
        const parsedUrl = new URL(configuredUrl);
        if (browserHostname && !isLocalHostname(browserHostname) && isLocalHostname(parsedUrl.hostname)) {
            return stripApiSuffix(getBrowserApiOriginForLocalEndpoint(parsedUrl));
        }

        return stripApiSuffix(parsedUrl.toString());
    } catch {
        return "";
    }
}

export function setUrl(url = process.env.REACT_APP_API_ENDPOINT, options = { prod: false }) {
    const resolvedUrl = getApiRoot(url);
    const configuredUrl = isValidApiEndpoint(resolvedUrl) ? resolvedUrl : "";
    const defaultUrl = "";

    if (options.prod) return configuredUrl || defaultUrl;
    if (process.env.NODE_ENV === "development") return configuredUrl || defaultUrl;
    return configuredUrl || defaultUrl;
}

const Axios = axios.create({
    // just set prod to true for using production server
    baseURL: setUrl(process.env.REACT_APP_API_ENDPOINT, { prod: false }),
    
});

Axios.interceptors.request.use(
    (req) => {
        const token = getCookie("sAuthToken");
        if (!req.headers.Authorization && token) {
            req.headers.Authorization = token;
            return req;
        }
        return req;
    },
    (err) => {
        return Promise.reject(err);
    }
);
Axios.interceptors.response.use(
    (res) => {
        return res;
    },
    (err) => {
        if (err?.code?.includes?.("ERR_NETWORK")) {
            ReactToastify("Network Error", "error");
            removeToken();
            setTimeout(() => {
                window.location.href = "/login";
            }, 2200);
            return Promise.reject(err);
        }
        if (err?.response?.status === 401) {
            removeToken();
            window.location.href = "/login";
            return Promise.reject(err);
        }
        return Promise.reject(err);
    }
);

export default Axios;
