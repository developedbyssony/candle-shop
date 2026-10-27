// 링크를 카톡·인스타 등에 붙였을 때 뜨는 썸네일(app/opengraph-image.jpg)을 굽습니다.
//
// 썸네일은 사이트 첫 화면(히어로) 그대로입니다. 따로 그린 원판을 두면 히어로를 고칠 때마다 둘이 어긋나므로,
// 띄워 둔 사이트를 PC의 Edge/Chrome으로 열어 히어로를 찍습니다.
// 단, 다크모드 토글은 썸네일에 의미가 없어 숨기고, 부제 뒤 깜박이는 '_' 커서도 지웁니다(멈춘 그림에선 얼룩처럼 보임).
// 애니메이션이 다 끝난 모습이 나오도록 '동작 줄이기'를 켜고, 라이트 모드로 찍습니다.
//
// 사용법: 개발 서버를 띄운 뒤(npm run dev) node scripts/make-og-image.js [주소, 기본 http://localhost:3000]
const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const SITE = process.argv[2] ?? "http://localhost:3000";
const BROWSERS = [
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
];
// 1200×630(1.91:1)과 같은 비율의 데스크톱 화면. 히어로(콜라주 약 670px + 위아래 여백)가 한 화면에 다 들어오는 높이입니다.
const VIEW = { width: 1440, height: 756 };
const HIDE_CSS = `
  .theme-switch { visibility: hidden !important; }
  nextjs-portal { display: none !important; } /* 개발 서버의 N 표시 */
  .type-char::after { display: none !important; }
`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const browser = BROWSERS.find((p) => fs.existsSync(p));
  if (!browser) throw new Error("Edge나 Chrome을 찾지 못했습니다. BROWSERS에 경로를 더해 주세요.");

  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "og-profile-"));
  const proc = spawn(browser, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"]);
  try {
    // 브라우저가 고른 디버깅 포트는 프로필 폴더의 DevToolsActivePort에 적힙니다.
    let port;
    for (let i = 0; i < 100 && !port; i++) {
      await sleep(100);
      try {
        port = fs.readFileSync(path.join(profile, "DevToolsActivePort"), "utf8").split("\n")[0];
      } catch {}
    }
    if (!port) throw new Error("헤드리스 브라우저가 뜨지 않았습니다.");
    const target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === "page");

    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((r) => ws.addEventListener("open", r, { once: true }));
    let id = 0;
    const pending = new Map();
    ws.addEventListener("message", (e) => {
      const msg = JSON.parse(e.data);
      if (pending.has(msg.id)) {
        pending.get(msg.id)(msg);
        pending.delete(msg.id);
      }
    });
    const send = (method, params = {}) =>
      new Promise((resolve, reject) => {
        const n = ++id;
        pending.set(n, (msg) => (msg.error ? reject(new Error(`${method}: ${msg.error.message}`)) : resolve(msg.result)));
        ws.send(JSON.stringify({ id: n, method, params }));
      });

    await send("Emulation.setDeviceMetricsOverride", { ...VIEW, deviceScaleFactor: 1.25, mobile: false });
    await send("Emulation.setEmulatedMedia", {
      features: [
        { name: "prefers-reduced-motion", value: "reduce" },
        { name: "prefers-color-scheme", value: "light" },
      ],
    });
    await send("Page.enable");
    await send("Runtime.enable");
    await send("Page.navigate", { url: SITE });
    // 개발 서버는 첫 컴파일이 느려서, 히어로와 사진·글꼴이 다 뜰 때까지 바깥에서 물어보며 기다립니다.
    // (페이지 안에서 기다리면 이동 중에 그 페이지가 사라져 답이 오지 않습니다.)
    for (let i = 0; ; i++) {
      if (i > 120) throw new Error(`${SITE}이(가) 뜨지 않았습니다. 개발 서버가 켜져 있는지 확인하세요.`);
      await sleep(500);
      const { result } = await send("Runtime.evaluate", {
        returnByValue: true,
        expression: `document.readyState === "complete" && !!document.querySelector(".hero-intro") &&
          document.fonts.status === "loaded" && [...document.images].every((img) => img.loading === "lazy" || img.complete)`,
      });
      if (result.value) break;
    }
    await send("Runtime.evaluate", {
      expression: `(() => {
        try { localStorage.setItem("theme", "light"); } catch {}
        delete document.documentElement.dataset.theme;
        const s = document.createElement("style");
        s.textContent = ${JSON.stringify(HIDE_CSS)};
        document.head.appendChild(s);
        scrollTo(0, 0);
      })()`,
    });
    // 동작 줄이기에서도 남는 짧은 전환·지연 이미지가 자리 잡을 시간을 줍니다.
    await sleep(2500);

    const { data } = await send("Page.captureScreenshot", { format: "png" });
    ws.close();

    // 카톡 미리보기가 큰 PNG를 늦게 띄우므로 1200×630 jpg로 가볍게 줄입니다.
    await sharp(Buffer.from(data, "base64"))
      .resize(1200, 630, { fit: "cover" })
      .jpeg({ quality: 86, mozjpeg: true })
      .toFile(path.join(ROOT, "app/opengraph-image.jpg"));
    console.log("app/opengraph-image.jpg를 만들었습니다.");
  } finally {
    proc.kill();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
