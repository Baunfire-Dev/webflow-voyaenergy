const axios = require("axios");

const ACCOUNT = "dffc52f541ed5a2188c5a8961cc4002e";
const TOKEN = "cfut_ZZgbPN0aGdby9gVMC0sY1Du1B1wGbs7pWOYqThfj48172605";
const PROJECT = "webflow-soundhoundai";
const INTERVAL = 5000;
const PLAIN = process.argv.includes("--plain");

const TERMINAL = ["success", "failure", "canceled", "skipped"];

const hasCreds = Boolean(ACCOUNT && TOKEN);
if (!hasCreds) {
    const msg = "Missing CF_ACCOUNT_ID or CF_API_TOKEN";
    if (PLAIN) {
        console.warn(`[deploy:watch] ${msg} - watcher idle`);
    } else {
        console.error(msg);
        process.exit(1);
    }
}

let spinner = null;

if (!PLAIN) {
    const ora = require("ora").default;
    spinner = ora(`Watching ${PROJECT}...`).start();
}

const stamp = () => new Date().toLocaleTimeString();

const setStatus = (text) => {
    if (PLAIN) console.log(`[${stamp()}] ${text}`);
    else spinner.text = text;
};
const resolve = (kind, text) => {
    if (PLAIN) {
        console.log(`[${stamp()}] ${text}`);
    } else {
        spinner[kind](text);
        spinner.start(`Watching ${PROJECT}...`);
    }
};

let currentId = null;
let lastKey = null;
let seeded = false;

async function poll() {
    if (!hasCreds) return;

    try {
        const { data } = await axios.get(
            `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/pages/projects/${PROJECT}/deployments`,
            { headers: { Authorization: `Bearer ${TOKEN}` } }
        );

        const dep = data.result[0];
        if (!dep) {
            setStatus("No deployments yet...");
            return;
        }

        const stage = dep.latest_stage;
        const status = stage.status;
        const key = `${dep.id}:${stage.name}:${status}`;
        const isTerminal = TERMINAL.includes(status);

        if (!seeded) {
            seeded = true;
            currentId = dep.id;
            if (isTerminal) {
                lastKey = key;
                setStatus(`Watching ${PROJECT}... (last: ${status})`);
                return;
            }
        }

        if (dep.id !== currentId) {
            currentId = dep.id;
            lastKey = null;
            if (!PLAIN) spinner.start();
        }

        if (key === lastKey) return;
        lastKey = key;

        const short = dep.id.slice(0, 8);
        if (status === "success") {
            resolve("succeed", `Deployed! (${short})`);
        } else if (status === "failure") {
            resolve("fail", `Failed at ${stage.name} (${short})`);
        } else if (status === "canceled" || status === "skipped") {
            resolve("warn", `Deployment ${status} (${short})`);
        } else {
            setStatus(`${stage.name}: ${status}`);
        }
    } catch (e) {
        setStatus(`Error: ${e.response?.status ?? e.message} (retrying)`);
    }
}

async function loop() {
    await poll();
    setTimeout(loop, INTERVAL);
}

loop();