import { Argv } from "yargs";
import fs from "node:fs";
import { StartOptions } from "./start-options.js";

export function startOptionsBuilder(yargs: Argv): Argv<StartOptions> {
  return yargs
    .version(false)
    .config(
      "config",
      'Provide the path to a configuration JSON file, which can include all the other command options. You can use kebabcase ("log-level") or camelcase ("logLevel").',
      (configPath) => {
        if (configPath.trim() === "") {
          return {};
        }
        if (!fs.existsSync(configPath)) {
          throw new Error(`Config file '${configPath}' does not exist!`);
        }
        return JSON.parse(fs.readFileSync(configPath, "utf-8"));
      },
    )
    .option("log-level", {
      type: "string",
      choices: ["silly", "debug", "info", "warn", "error"],
      default: "info",
    })
    .option("disable-log-colors", {
      type: "boolean",
      default: false,
    })
    .option("storage-location", {
      type: "string",
      description:
        "Path to a directory where the application should store its data. Defaults to $HOME/.home-assistant-matter-hub",
    })
    .option("web-port", {
      type: "number",
      description: "Port used by the web application",
      default: 8482,
    })
    .option("mdns-network-interface", {
      type: "string",
      description: "Limit MDNS to this network interface",
    })
    .option("home-assistant-url", {
      type: "string",
      description: "The HTTP-URL of your Home Assistant URL",
    })
    .option("home-assistant-access-token", {
      type: "string",
      description: "A long-lived access token for your Home Assistant Instance",
    })
    .demandOption(["home-assistant-url", "home-assistant-access-token"]);
}