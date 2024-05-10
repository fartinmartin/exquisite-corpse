import * as iam from "aws-cdk-lib/aws-iam";
import { Cognito, StackContext, use } from "sst/constructs";
import { ApiStack } from "./api";
import { StorageStack } from "./storage";

export function AuthStack({ stack, app }: StackContext) {
	const { api } = use(ApiStack);
	const { buckets } = use(StorageStack);

	// Create a Cognito User Pool and Identity Pool
	const auth = new Cognito(stack, "Auth");
	// https://docs.aws.amazon.com/cognito/latest/developerguide/switching-identities.html#switching-identities-1.javascript
	// https://sst.dev/chapters/auth-in-serverless-apps.html

	auth.attachPermissionsForUnauthUsers(stack, [
		api,
		// users can only read (get) objects from our buckets
		// app uses lambda fns to write/delete objects from our buckets
		new iam.PolicyStatement({
			actions: ["s3:GetObject"],
			effect: iam.Effect.ALLOW,
			resources: [buckets.corpses.bucketArn, buckets.sections.bucketArn],
		}),
	]);

	stack.addOutputs({
		Region: app.region,
		UserPoolId: auth.userPoolId,
		UserPoolClientId: auth.userPoolClientId,
		IdentityPoolId: auth.cognitoIdentityPoolId,
	});

	return {
		auth,
	};
}
