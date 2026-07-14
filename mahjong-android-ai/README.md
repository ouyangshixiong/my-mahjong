# 麻将 AI Android

这是 `mahjong-electron-ai` 的轻量 Android 重写版。Android 客户端仍然只有一个 Java `Activity`、系统 WebView 和原生 HTML/CSS/JavaScript；Node 服务端负责动态下发完整游戏规则和开屏广告。

客户端不会执行服务端 JavaScript。服务端只下发经过严格校验的声明式 JSON；连接失败、规则错误或广告图片失败时直接显示错误，不使用 APK 内旧规则继续运行。

## 目录

- `app/`：无 AndroidX 依赖的 Android WebView 壳
- `client/`：触屏游戏界面、远程配置桥接和开屏广告
- `game/`：本地算番、胡牌与机器人算法
- `server/`：零第三方运行时依赖的 Node HTTP 服务
- `server/config/rules.json`：服务端当前下发的全部玩法规则
- `server/config/splash-ad.json`：开屏广告启停、图片、跳转链接和展示时长
- `server/public/splash-ad.svg`：默认广告图片
- `dist/`：可上传到网站的 APK 下载页

最低 Android 版本为 Android 6.0（API 23），固定横屏运行。

## 启动服务端

服务端要求显式设置端口：

```bash
HOST=127.0.0.1 PORT=5057 npm run server:start
```

接口：

```text
GET /api/v1/bootstrap
GET /assets/splash-ad.svg
OPTIONS /api/v1/bootstrap
```

`/api/v1/bootstrap` 每次请求都会重新读取并校验两个配置文件，因此修改规则或广告后不需要重新打 APK，也不需要重启 Node 进程。配置无效时返回 `500 SERVER_CONFIG_INVALID`，不会继续下发旧配置。

生产环境必须把 Node 服务放在 HTTPS 反向代理后。正式 APK 拒绝 HTTP 服务地址和 HTTP 广告链接。

### 关闭开屏广告

将 `server/config/splash-ad.json` 明确设置为：

```json
{
  "id": "disabled-ad",
  "enabled": false,
  "imageUrl": null,
  "clickUrl": null,
  "durationMs": 0,
  "altText": ""
}
```

## 测试与调试 APK

```bash
npm install
npm test
export MAHJONG_SERVICE_URL='https://watermark.mmgss.com/mahjong/'
npm run android:debug
```

调试 APK 必须显式写入服务地址，不提供默认地址。当前已部署的地址为 `https://watermark.mmgss.com/mahjong/`；公网服务必须使用 HTTPS，HTTP 仅限本机开发地址。先启动服务，再安装：

```text
app/build/outputs/apk/debug/app-debug.apk
```

构建需要 JDK 17、Android SDK Platform 33 和 Build Tools 35.0.0，并设置：

```bash
export JAVA_HOME=/path/to/jdk-17
export ANDROID_SDK_ROOT=/path/to/android-sdk
```

## 正式签名与服务地址

首次发布前创建并永久备份自己的签名文件。后续升级必须使用同一个签名，否则用户无法覆盖安装。

```bash
keytool -genkeypair -v \
  -keystore release/mahjong-ai.jks \
  -alias mahjong-ai \
  -keyalg RSA -keysize 4096 -validity 10000
```

然后构建正式 APK：

```bash
export MAHJONG_SERVICE_URL='https://watermark.mmgss.com/mahjong/'
export MAHJONG_KEYSTORE="$PWD/release/mahjong-ai.jks"
export MAHJONG_KEYSTORE_PASSWORD='你的签名库密码'
export MAHJONG_KEY_ALIAS='mahjong-ai'
export MAHJONG_KEY_PASSWORD='你的密钥密码'
npm run android:release
```

输出文件为 `dist/mahjong-ai-1.0.0.apk`。服务域名会在构建时写入 APK；更换域名需要重新构建和签名，但修改规则或广告内容不需要更新 APK。

## 网页下载分发

把 `dist/index.html` 和正式签名后的 `dist/mahjong-ai-1.0.0.apk` 上传到 `https://watermark.mmgss.com/mahjong/` 对应的 HTTPS 目录。服务器应为 APK 返回：

当前测试下载页：<https://watermark.mmgss.com/mahjong/>

```text
Content-Type: application/vnd.android.package-archive
Content-Disposition: attachment
```

用户需要在 Android 系统中允许浏览器“安装未知应用”。
