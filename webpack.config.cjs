const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");

const BASE_JS = "./src/client/js/";
module.exports = {
  //변경하고자 하는 파일 (예쁜js)
  entry: {
    main: BASE_JS + "main.js",
    videoPlayer: BASE_JS + "videoPlayer.js",
    recoder: BASE_JS + "recorder.js",
    commentSection: BASE_JS + "commentSection.js",
  },
  mode: "development",
  watch: true,
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/styles.css",
    }),
  ],

  //처리한 파일은 보낼 곳
  output: {
    filename: "js/[name].js",
    path: path.resolve(__dirname, "assets"),
    clean: true,
  },

  //특정파일에 변형을 적용할때
  //babel loader를 사용하며 몇가지 옵션을 전달
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }]],
          },
        },
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"], //웹팩 적용 역순으로 적용
      },
    ],
  },
};
