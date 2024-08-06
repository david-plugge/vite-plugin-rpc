import * as v from 'valibot';

const signinSchema = v.object({ username: v.string() });

export async function signin(input: v.InferInput<typeof signinSchema>) {
	const result = v.safeParse(signinSchema, input);
	if (!result.success) {
		return {
			type: 'validation_error',
			issues: v.flatten<typeof signinSchema>(result.issues)
		} as const;
	}

	return {
		type: 'success',
		input
	} as const;
}
