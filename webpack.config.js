const CopyWebpackPlugin = require("copy-webpack-plugin");
const HardSourceWebpackPlugin = require("hard-source-webpack-plugin");

module.exports = (env, options) => {
  const config = {
    entry: {
      background: "./src/scripts/background.ts",
      options: "./src/scripts/options.ts",
    },
    output: {
      filename: "./scripts/[name].js",
    },
    cache: true,
    plugins: [
      new HardSourceWebpackPlugin(),
      new CopyWebpackPlugin([
        {
          from: "**/*",
          context: "src",
          ignore: ["scripts/**/*", "manifest.json"],
        },
        {
          from: "manifest.json",
          context: "src",
          transform: (content, path) => {
            if (env === undefined || !("FIREFOX" in env)) {
              return content;
            }
            const json = JSON.parse(content.toString());
            delete json["applications"];
            return JSON.stringify(json, null, 4);
          },
        },
      ]),
    ],
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
