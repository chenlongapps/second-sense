# 秒感 · 像素读秒挑战

一个响应式像素风读秒游戏，使用 HTML、CSS 和原生 JavaScript，不需要 npm 安装或构建。

## 本地运行

解压后进入 `second-sense` 文件夹，在终端运行：

```sh
python3 -m http.server 8080
```

浏览器访问 http://localhost:8080 。Windows 也可使用 `py -m http.server 8080`。

## 文件

- `index.html`：页面结构、文案和控件。
- `styles.css`：像素风界面、红色数码管、像素按钮和响应式布局。
- `game.js`：目标选择、计时、评分、当前会话统计和键盘操作。
- `sounds.js`：Web Audio 合成音效、静音开关和音效设置记忆。
- `zpix.woff2`：中文像素字体。
- `font-license.txt`：第三方字体来源和授权说明。

## 操作

选择 3、5 或 10 秒，点击红色按钮或按空格键开始，再次点击或按空格键停止。计时过程中隐藏时间；停止后显示实际用时、误差和得分。音效开关位于右上角，设置仅保存在当前浏览器。成绩统计在刷新后重置。

## 自行部署

将此文件夹内全部文件上传到支持静态网站的服务器或托管平台，入口文件是 `index.html`。无需后端、数据库或 API 密钥。音效由浏览器合成，无需额外音频文件。

## 字体授权

Zpix 最像素由 SolidZORO 制作，当前附带的是未修改的官方字体。作者允许个人和教育产品免费使用，商业产品需要另行授权，具体见 `font-license.txt` 和 https://github.com/SolidZORO/zpix-pixel-font 。
