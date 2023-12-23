import type { SSTConfig } from "sst";
import { Bucket, SvelteKitSite } from "sst/constructs";

export default {
	config(_input) {
		return {
			name: "exquisite-corpse",
			region: "us-west-1",
		};
	},
	stacks(app) {
		app.stack(function Site({ stack }) {
			const bucket = new Bucket(stack, "public");

			const site = new SvelteKitSite(stack, "site", {
				bind: [bucket],
			});

			stack.addOutputs({
				url: site.url,
			});
		});
	},
} satisfies SSTConfig;
