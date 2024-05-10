import { Bucket, BucketCorsRule, StackContext, Table } from "sst/constructs";

// https://sst.dev/chapters/handle-cors-in-s3-for-file-uploads.html
const cors = [
	{
		maxAge: "1 day",
		allowedOrigins: ["*"],
		allowedHeaders: ["*"],
		allowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
	},
] satisfies BucketCorsRule[];

export function StorageStack({ stack }: StackContext) {
	const corpses = new Bucket(stack, "Corpses", { cors });
	const sections = new Bucket(stack, "Sections", { cors });

	// const table = new Table(stack, "Notes", {
	// 	fields: {
	// 		userId: "string",
	// 		noteId: "string",
	// 	},
	// 	primaryIndex: { partitionKey: "userId", sortKey: "noteId" },
	// });

	return {
		buckets: {
			corpses,
			sections,
		},
		tables: {
			// users?
			// corpses?
			// sections?
		},
	};
}
