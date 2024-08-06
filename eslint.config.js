import js from '@eslint/js';
import ts from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default ts.config(
	js.configs.recommended,
	...ts.configs.recommendedTypeChecked,
	...ts.configs.stylisticTypeChecked,
	prettier,
	{
		languageOptions: {
			parserOptions: {
				projectService: true,
			},
		},
	},
	{
		ignores: ['node_modules/', 'build/', 'dist/', '**/.*', 'vitest.config.ts', 'eslint.config.js', 'examples/'],
	},
	{
		rules: {
			'@typescript-eslint/consistent-type-imports': 'error',
		},
	},
);
