function FindProxyForURL(url, host) {
    url = url.toLowerCase();
    host = host.toLowerCase();

    if ((host == "localhost") ||
            (shExpMatch(host, "localhost.*")) ||
            (host == "127.0.0.1")) {
        return "DIRECT";
    }

    if(url.substring(0, 5) == "http:"){
        return "PROXY localhost:${PROXY_HTTP_PORT}";
    } else if(url.substring(0, 6) == "https:"){
        return "PROXY localhost:${PROXY_HTTPS_PORT}";
    } else {
        return "DIRECT";
    }
}
