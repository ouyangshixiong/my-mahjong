# VPS 177.3.40.208 部署说明

本说明对应 Ubuntu 24.04、Node.js 22 和 systemd。SSH 密码、签名密码等凭据不要写进仓库或脚本；建议部署完成后配置 SSH 公钥并轮换当前 root 密码。

## 1. 上传服务端文件

服务端运行需要 `server/`、`game/` 和 `package.json`；网页下载入口还需要 `dist/index.html` 和 APK：

```bash
ssh root@177.3.40.208 'mkdir -p /opt/mahjong-android-ai'
rsync -av --delete \
  server game package.json dist \
  root@177.3.40.208:/opt/mahjong-android-ai/
```

以上命令在 `mahjong-android-ai` 目录中执行。

## 2. 创建低权限服务用户

```bash
ssh root@177.3.40.208
useradd --system --home /nonexistent --shell /usr/sbin/nologin mahjong
chown -R root:mahjong /opt/mahjong-android-ai
find /opt/mahjong-android-ai -type d -exec chmod 750 {} \;
find /opt/mahjong-android-ai -type f -exec chmod 640 {} \;
chown root:root /opt/mahjong-android-ai
chmod 755 /opt/mahjong-android-ai
chown -R root:root /opt/mahjong-android-ai/dist
find /opt/mahjong-android-ai/dist -type d -exec chmod 755 {} \;
find /opt/mahjong-android-ai/dist -type f -exec chmod 644 {} \;
```

如果 `mahjong` 用户已经存在，`useradd` 会报错，应先检查而不是重复创建：

```bash
id mahjong
```

## 3. 安装 systemd 服务

把 `deploy/mahjong-android-ai.service` 上传到 `/etc/systemd/system/`：

```bash
scp deploy/mahjong-android-ai.service root@177.3.40.208:/etc/systemd/system/
ssh root@177.3.40.208 'systemctl daemon-reload && systemctl enable --now mahjong-android-ai'
```

检查状态与日志：

```bash
ssh root@177.3.40.208 'systemctl status mahjong-android-ai --no-pager'
ssh root@177.3.40.208 'journalctl -u mahjong-android-ai -n 100 --no-pager'
```

## 4. 配置 HTTPS 反向代理

服务只监听 `127.0.0.1:5057`，不要在云安全组或 UFW 中放行公网 5057。公网 HTTPS 基地址为：

```text
https://watermark.mmgss.com/mahjong/
```

把 `deploy/nginx-mahjong-location.conf` 上传到 `/etc/nginx/snippets/mahjong-android-ai.conf`，并在 `watermark.mmgss.com` 的 HTTPS `server` 块中加入：

```nginx
include /etc/nginx/snippets/mahjong-android-ai.conf;
```

如果同一个 HTTP `server` 块还承载其他业务，只把麻将路径改为 HTTPS 跳转：

```nginx
location = /mahjong {
    return 308 https://watermark.mmgss.com/mahjong/;
}

location ^~ /mahjong/ {
    return 308 https://watermark.mmgss.com$request_uri;
}
```

不要在 HTTP `server` 块中 include 麻将 HTTPS 片段。

然后执行：

```bash
nginx -t
systemctl reload nginx
```

VPS 内部验证：

```bash
curl -fsS http://127.0.0.1:5057/api/v1/bootstrap
curl -fsS -o /dev/null http://127.0.0.1:5057/assets/splash-ad.svg
```

本机 HTTPS 验证：

```bash
curl -fsS https://watermark.mmgss.com/mahjong/api/v1/bootstrap
curl -fsS -o /dev/null https://watermark.mmgss.com/mahjong/assets/splash-ad.svg
curl -fsS https://watermark.mmgss.com/mahjong/ | grep '麻将 AI 训练'
curl -fsSI https://watermark.mmgss.com/mahjong/mahjong-ai-1.0.0.apk
curl -fsS https://watermark.mmgss.com/mahjong/mahjong-ai-1.0.0.apk \
  -o /tmp/mahjong-ai-1.0.0.apk
sha256sum /tmp/mahjong-ai-1.0.0.apk
```

当前测试包的 SHA-256 应为：

```text
6c3fa706bc27ba04b6ff9f50895e775d0138bad8878a89ced984e73706cd8d1d
```

## 5. 更新规则和广告

规则文件：

```text
/opt/mahjong-android-ai/server/config/rules.json
```

广告配置和图片：

```text
/opt/mahjong-android-ai/server/config/splash-ad.json
/opt/mahjong-android-ai/server/public/splash-ad.svg
```

服务端会在每次 bootstrap 请求时重新读取配置，修改有效配置后不需要重启服务。配置无效时接口直接返回 `500 SERVER_CONFIG_INVALID`，不会继续使用旧规则。

修改前应在本地执行：

```bash
npm install
npm test
```

## 6. 构建连接 VPS 的测试 APK

当前测试使用已部署的受信任 HTTPS 地址：

```bash
export MAHJONG_SERVICE_URL='https://watermark.mmgss.com/mahjong/'
npm install
npm run android:debug
```

输出：

```text
app/build/outputs/apk/debug/app-debug.apk
```

正式对外发布时继续使用该 HTTPS 地址，并使用自己的永久签名执行 `npm run android:release`。正式构建拒绝 HTTP 服务地址。

## 7. 常用维护命令

```bash
systemctl restart mahjong-android-ai
systemctl stop mahjong-android-ai
systemctl start mahjong-android-ai
systemctl status mahjong-android-ai --no-pager
journalctl -u mahjong-android-ai -f
```
