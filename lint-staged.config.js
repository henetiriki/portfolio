module.exports = {
  '*.{ts,tsx,js,jsx}': () => ['next lint --fix'],
  '*': () => ['yarn prettier:write'],
};
