const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = (env, options) => {
  const isChrome = env !== undefined && "CHROME" in env;

  const copyPluginConfig = [
    {
      from: "**/*",
      context: "src",
      ignore: ["scripts/**/*", "manifest.json", "reload.js"],
    },
    {
      from: "manifest.json",
      context: "src",
      transform: (content, path) => {
        const json = JSON.parse(content.toString());

        if (isChrome) {
          delete json["applications"];

          if (options.mode === "development") {
            json["background"]["scripts"].push("reload.js");
          }
        }

        return JSON.stringify(json, null, 4);
      },
    },
  ];

  if (options.mode === "development" && isChrome) {
    copyPluginConfig.push({
      from: "reload.js",
      context: "src",
    });
  }

  const config = {
    entry: {
      background: "./src/scripts/background.ts",
      options: "./src/scripts/options.ts",
    },
    output: {
      filename: "./scripts/[name].js",
    },
    plugins: [new CopyWebpackPlugin(copyPluginConfig)],
    module: {
      rules: [
        {
          test: /\.ts$/,
          loader: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: [".ts", ".js"],
      modules: ["node_modules/", "src/scripts/"],
    },
  };

  if (options.mode === "development") {
    config["devtool"] = "inline-source-map";
  }

  return config;
};
