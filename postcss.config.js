module.exports = {
  preset: "default",
  plugins: [
    require("autoprefixer"),
    require("postcss-import"),
    require("postcss-nested"),
    // require("postcss-uncss")({
    //   html: ["web/**/*.html"],
    //   ignore: [
    //     // defined inline
    //   ],
    // }),
  ],
};
