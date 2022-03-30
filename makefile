.PHONY : run test tests

run: 
	npx ts-node -r tsconfig-paths/register src/index.ts

test:
	@echo 'Starting Tests'
	npx ts-node tests/tests.ts

tests: test