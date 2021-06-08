module.exports = {
  preset: "default",
  plugins: [
    require("autoprefixer"),
    // require('module-name-2')({
    //     option-a: 1,
    //     option-b: "quoted value",
    // }),
    require("postcss-import"),
    require("postcss-nested"),
    require("postcss-uncss")({ html: ["web/**/*.html"] }),
  ],
};
