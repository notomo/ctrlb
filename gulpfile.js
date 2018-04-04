const gulp = require("gulp");
const del = require("del");
const gulpSequence = require("gulp-sequence");
const webpack = require("webpack");
const gulpWebpack = require("webpack-stream");
const plumber = require("gulp-plumber");
const named = require("vinyl-named");

gulp.task("clean", () => {
  return del("dist/**/*");
});

gulp.task("manifest", () => {
  return gulp.src("src/manifest.json").pipe(gulp.dest("dist"));
});

gulp.task("images", () => {
  return gulp.src("src/**/*.png").pipe(gulp.dest("dist"));
});

gulp.task("pages", () => {
  return gulp.src("src/**/*.html").pipe(gulp.dest("dist"));
});

gulp.task(
  "build",
  gulpSequence("clean", ["manifest", "scripts", "images", "pages"])
);

gulp.task("default", ["build"]);

gulp.task("watch", () => {
  gulp.watch("src/manifest.json", ["manifest"]);
  gulp.watch("src/scripts/**/*.ts", ["scripts"]);
  gulp.watch("src/images/**/*.png", ["images"]);
  gulp.watch("src/pages/**/*.html", ["pages"]);
});

gulp.task("scripts", cb => {
  return gulp
    .src("src/**/*.ts")
    .pipe(named())
    .pipe(
      plumber({
        errorHandler() {}
      })
    )
    .pipe(
      gulpWebpack(
        {
          entry: {
            background: "./src/scripts/background.ts",
            options: "./src/scripts/options.ts"
          },
          output: {
            filename: "[name].js"
          },
          plugins: [],
          module: {
            rules: [
              {
                test: /\.ts$/,
                loader: "ts-loader",
                exclude: /node_modules/
              }
            ]
          },
          resolve: {
            extensions: [".ts", ".js"],
            modules: ["node_modules/", "src/scripts/"]
          }
        },
        webpack
      )
    )
    .pipe(gulp.dest("dist/scripts"));
});
