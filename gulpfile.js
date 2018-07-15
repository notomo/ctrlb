const gulp = require("gulp");
const del = require("del");
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

gulp.task("watch", () => {
  gulp.watch("src/manifest.json", gulp.task("manifest"));
  gulp.watch("src/scripts/**/*.ts", gulp.task("scripts"));
  gulp.watch("src/images/**/*.png", gulp.task("images"));
  gulp.watch("src/pages/**/*.html", gulp.task("pages"));
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

gulp.task(
  "build",
  gulp.series(
    gulp.task("clean"),
    gulp.parallel("manifest", "scripts", "images", "pages")
  )
);

gulp.task("default", gulp.task("build"));
