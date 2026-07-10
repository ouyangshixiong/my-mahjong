# BeiMi Mahjong AI Trainer

一个从旧贝密棋牌项目中拆出的麻将方向新子项目：

- `client/`：Electron 客户端，负责洗牌、发牌、摸打、牌河、四家单机回合、界面和交互。
- `server/`：轻量 Node.js 策略服务，提供玩法规则集、算番规则、向听/听牌/出牌建议，不保存牌局状态。
- `assets/`：复用旧项目中的房间背景与麻将语音资源。
- `tests/`：规则、AI 和服务 smoke 测试。

## 安装依赖

```bash
npm install
```

如果 Electron 二进制下载失败，可使用镜像重新安装：

```bash
ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/ npx install-electron --no
```

## 启动服务端

```bash
./start-server.sh
```

无参数时监听 `127.0.0.1:5057`。也可以显式指定监听地址和端口：

```bash
./start-server.sh 127.0.0.1 5057
```

部署到 VPS 并监听所有网卡：

```bash
./start-server.sh 0.0.0.0 5057
```

## 启动客户端

客户端只连接指定的服务端，不会在本机创建服务端进程：

```bash
./start-client.sh http://127.0.0.1:5057
```

连接 VPS 时传入 VPS 的实际地址，生产环境应使用 HTTPS 域名：

```bash
./start-client.sh https://mahjong-api.example.com
```

## 验证

```bash
npm test
npm run smoke
```

## 功能边界

当前版本是麻将训练/单机练习软件：

- 支持服务端下发玩法规则集，客户端可点击“更新玩法”重新拉取。
- 支持四川麻将血战玩法：三门 108 张，开局定缺；缺门牌未打完时强制优先打缺门牌，清空后才可胡。
- 支持点炮、一炮多响、最后四张强制胡；玩家胡牌后退出牌局，其余玩家继续到三家胡牌或牌墙摸完。
- 血战流局会执行查花猪、查大叫状态判定；当前训练版只展示结算判定，不维护积分账户。
- 支持红中玩法：三门加 4 张红中，红中作为癞子补顺子、刻子、对子。
- 支持四家摸打，玩家为东家。
- 支持标准 4 面子 1 将与七对子胡牌判断。
- 支持由服务端下发的算番表，并在客户端按当前玩法显示番型和总番。
- 支持 AI 出牌建议、听牌列表、估算向听、形状分。
- 服务端不处理支付、房卡、真钱、房间结算。

## 服务接口

- `GET /rulesets`：下发全部玩法和算番规则。
- `GET /rulesets/:id`：下发指定玩法。
- `POST /ai/analyze`：按 `rulesetId` 分析手牌。
- `POST /ai/lack-suit`：按起手牌返回定缺建议。
- `POST /ai/discard`：按 `rulesetId` 返回 AI 出牌建议。
- `POST /ai/score`：按 `rulesetId` 算番。

`/ai/analyze`、`/ai/discard`、`/ai/score` 必须显式传入 `lackSuit`；四川血战传 `m`/`p`/`s`，无定缺玩法传 `null`。

下一阶段可以继续补：碰杠交互、完整查花猪/查大叫积分转移、更多成都番型、牌谱复盘、局后 AI 讲解。
