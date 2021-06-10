module.exports = {
  preset: "default",
  plugins: [
    require("autoprefixer"),
    require("postcss-import"),
    require("postcss-nested"),
    require("postcss-uncss")({
      html: ["web/**/*.html"],
      ignore: [".em", ".pt>.sq", ".pt>.sq>span", "#card", "#card.an"],
    }),
  ],
};
