import * as core from "@actions/core";
import { exec } from "@actions/exec";
import { saveStorePaths } from "../utils";

export const configure = async () => {
	core.startGroup("Configure Attic");

	try {
		const endpoint = core.getInput("endpoint");
		const cache = core.getInput("cache");
		const token = core.getInput("token");
		const skipUse = core.getInput("skip-use");
		const create = core.getInput("create");

		core.info("Logging in to Attic cache");
		await exec("attic", ["login", "--set-default", cache, endpoint, token]);

		if (create === "true") {
			core.info("Creating Attic cache");
			try {
				await exec("attic", ["cache", "create", "--public", cache]);
			} catch (err: any) {
				core.info("Attic cache already exists, continuing...");
			}
		} else {
			core.info("Skip Attic cache creation");
		}

		if (skipUse === "true") {
			core.info("Not adding Attic cache to substituters as skip-use is set to true");
		} else {
			core.info("Adding Attic cache to substituters");
			await exec("attic", ["use", cache]);
		}

		core.info("Collecting store paths before build");
		await saveStorePaths();
	} catch (e) {
		core.setFailed(`Action failed with error: ${e}`);
	}

	core.endGroup();
};
