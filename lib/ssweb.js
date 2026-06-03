import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";

const WEB = "https://pikwy.com";
const API = "https://api.pikwy.com/";

const CONFIG = {
  input: "https://ditzzx.my.id",
  delay: 3000,
  fullSize: false,
  width: 1920,
  height: 1080,
  scale: 100,
  zoom: 100,
  format: "png",
  responseType: "jweb",
  token: 125
};

const UA =
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36";

const jar = new CookieJar();

const client = wrapper(
  axios.create({
    jar,
    withCredentials: true,
    timeout: 120000,
    validateStatus: () => true,
    headers: {
      "user-agent": UA,
      "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7"
    }
  })
);

function boolNum(value) {
  return value ? 1 : 0;
}

function buildParams(config) {
  return {
    tkn: String(config.token),
    d: String(config.delay),
    u: encodeURIComponent(config.input),
    fs: String(boolNum(config.fullSize)),
    w: String(config.width),
    h: String(config.height),
    s: String(config.scale),
    z: String(config.zoom),
    f: String(config.format).toLowerCase(),
    rt: config.responseType
  };
}

async function initSession() {
  await client.get(WEB, {
    headers: {
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      referer: "https://www.google.com/",
      "sec-ch-ua": `"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"`,
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": `"Android"`,
      "sec-fetch-site": "cross-site",
      "sec-fetch-mode": "navigate",
      "sec-fetch-user": "?1",
      "sec-fetch-dest": "document",
      "upgrade-insecure-requests": "1"
    }
  });
}

async function screenshot(config = CONFIG) {
  const params = buildParams(config);

  const res = await client.get(API, {
    params,
    headers: {
      accept: "*/*",
      origin: WEB,
      referer: `${WEB}/`,
      "sec-ch-ua": `"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"`,
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": `"Android"`,
      "sec-fetch-site": "same-site",
      "sec-fetch-mode": "cors",
      "sec-fetch-dest": "empty",
      priority: "u=1, i"
    }
  });

  const ok = res.status >= 200 && res.status < 300 && typeof res.data === "object" && !!res.data.iurl;

  return {
    Status: ok,
    Code: res.status,
    Input: config.input,
    Result_url: ok ? res.data.iurl || null : null,
    Download_url: ok ? res.data.durl || null : null,
    Error: ok ? null : typeof res.data === "string" ? res.data : res.statusText
  };
}

async function main() {
  try {
    await initSession();
    const result = await screenshot();
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.log(
      JSON.stringify(
        {
          Status: false,
          Code: 500,
          Input: CONFIG.input,
          Result_url: null,
          Download_url: null,
          Error: err.message
        },
        null,
        2
      )
    );
  }
}

// main(); // disabled for server useexport { initSession, screenshot };
