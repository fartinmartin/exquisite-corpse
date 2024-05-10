import { Api, Config, StackContext, use } from "sst/constructs";
// import { StorageStack } from "./storage";

export function ApiStack({ stack }: StackContext) {
	// const { table } = use(StorageStack);

	// Create the API
	const api = new Api(stack, "Api", {
		defaults: {
			authorizer: "iam",
			function: {
				// bind: [table],
			},
		},
		routes: {
			"GET /notes": "packages/functions/src/list.main",
			"POST /notes": "packages/functions/src/create.main",
			"GET /notes/{id}": "packages/functions/src/get.main",
			"PUT /notes/{id}": "packages/functions/src/update.main",
			"DELETE /notes/{id}": "packages/functions/src/delete.main",
			"POST /billing": "packages/functions/src/billing.main",
		},
	});

	stack.addOutputs({
		ApiEndpoint: api.url,
	});

	return {
		api,
	};
}
