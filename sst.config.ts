import type { SSTConfig } from "sst";
import { FrontendStack } from "./stacks/frontend";
import { AuthStack } from "./stacks/auth";
import { StorageStack } from "./stacks/storage";
import { ApiStack } from "./stacks/api";

export default {
	config(_input) {
		return {
			name: "exquisite-corpse",
			region: "us-west-2",
		};
	},
	stacks(app) {
		app
			.stack(StorageStack)
			.stack(ApiStack)
			.stack(AuthStack)
			.stack(FrontendStack);
	},
} satisfies SSTConfig;
