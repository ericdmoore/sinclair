1. Walk through all the js files from the root
2. change all `require` to `import` styles
3. adjust the from location to be a `relative URL` instead of a `NPM token`
4. Create default exports out of all other exports - if none provided
5. alter `module.exports` to use `export const`