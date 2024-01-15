import { StackContext, SvelteKitSite } from "sst/constructs";

// https://github.com/sst/demo-notes-app/blob/main/stacks/FrontendStack.ts
export function FrontendStack({ stack }: StackContext) {
	const site = new SvelteKitSite(stack, "site", {
		path: "packages/frontend",
		buildCommand: "pnpm run build",
	});

	stack.addOutputs({
		SiteUrl: site.customDomainUrl || site.url,
	});
}
