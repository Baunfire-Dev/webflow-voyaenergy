const axios = require("axios");
const notifier = require("node-notifier");
const ora = require("ora").default;
const { execSync } = require("child_process");
const config = require("./cf-watch.config.json");

const ACCOUNT = "dffc52f541ed5a2188c5a8961cc4002e";
const TOKEN = "cfat_Gio0InUmJf71IMo7w9gzM12j7wKHadq8IsUTSbvB53b8e08d";
const PROJECT = "webflow-voyaenergy";

if (!ACCOUNT || !TOKEN) {
    console.error("Missing CF_ACCOUNT_ID or CF_API_TOKEN");
    process.exit(1);
}

const SHA = execSync("git rev-parse HEAD").toString().trim();
const spinner = ora(`Watching ${PROJECT}...`).start();

async function poll() {
    try {
        const { data } = await axios.get(
            `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/pages/projects/${PROJECT}/deployments`,
            { headers: { Authorization: `Bearer ${TOKEN}` } }
        );
        const dep = data.result.find(d => d.deployment_trigger?.metadata?.commit_hash === SHA);
        if (!dep) {
            spinner.text = "Waiting for deployment...";
            return;
        }
        spinner.text = `${dep.latest_stage.name} (${dep.latest_stage.status})`;
        if (dep.latest_stage.status === "success") {
            spinner.succeed("Deployment successful!");
            notifier.notify(
                {
                    title: "Cloudflare Pages",
                    message: `${PROJECT} deployed successfully ✅`,
                    appName: "Cloudflare Watcher",
                    appID: "Cloudflare Watcher",
                },
                () => process.exit(0)
            );
        }
        if (dep.latest_stage.status === "failure") {
            spinner.fail("Deployment failed!");
            notifier.notify(
                {
                    title: "Cloudflare Pages",
                    message: `${PROJECT} deployment failed ❌`,
                    appName: "Cloudflare Watcher",
                    appID: "Cloudflare Watcher",
                },
                () => process.exit(1)
            );
        }
    } catch (e) {
        spinner.fail(e.message);
        console.log(e.response?.status);
        console.log(e.response?.data);
        process.exit(1);
    }
}
poll();
setInterval(poll, 5000);
