const path = require("path");
module.exports = {
  webpackFinal: async (config, ...x) => {
    config.module.rules.push({
      test: /\.tsx?$/,
      use: 'ts-loader',
      include: [
        path.resolve(__dirname, '../../react-draggable-hooks'),
        path.resolve(__dirname, '../../react-resizable-hooks')
      ],
    })

    return config;
  },
  "typescript": {
    check: false
  },
  "stories": [
    "../stories/**/*.stories.mdx",
    "../stories/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials"
  ]
}
