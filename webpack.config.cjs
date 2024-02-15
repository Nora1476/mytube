const path = require("path");

module.exports = {
  //변경하고자 하는 파일 (예쁜js)
  entry: "./src/client/js/main.js",
  mode: "development",
  //처리한 파일은 보낼 곳
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "assets", "js"),
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
        use: ["style-loader", "css-loader", "sass-loader"], //웹팩 적용 역순으로 적용
      },
    ],
  },
};
