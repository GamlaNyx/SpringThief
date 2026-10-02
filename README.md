# 春泥棒

这是一个面向区块链方向招新的网页趣味题：玩家在模拟工作室桌面里调查 NFT《春》失窃案，收集四组助记词线索，完成小游戏和低门槛解密，最后在钱包恢复台理解并执行“助记词 → 私钥 → 地址”的流程。

## Run

```bash
npm install
npm run dev -- --host 127.0.0.1
```

生产构建：

```bash
npm run build
```

基础数据测试：

```bash
npm test
```

生产环境部署请参阅 [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)。

GitHub Pages 部署请在仓库 Settings → Pages 中将 Source 设置为 **GitHub Actions**，推送 `main` 后工作流会自动发布到 `https://GamlaNyx.github.io/SpringThief/`。

## Current implementation notes

- 四组题面词已固定：`only sunny day`、`fever dream high`、`forever night day`、`your how good`。
- 浏览器模块使用本地模拟搜索数据，不依赖实际互联网搜索。
- 钱包恢复台使用项目本地打包的 ethers v5 API，并按 `m/44'/60'/0'/0/0` 派生 Ethereum 账户，不依赖外部 ethers CDN。
- 恢复台使用明确的教学派生模式：固定剧情词组仍按助记词种子公式、BIP-32/BIP-44 路径和 Ethereum 地址规则计算，但不因词组未通过 BIP-39 校验和而阻断工具；界面会明确标注该状态。
- 恢复台按“解锁工具 → 使用工具”依次展示助记词种子、派生私钥和 Ethereum 地址；玩家将地址复制到最终验证栏后提交。
- 线索收集后按每条线索的 `slot` 自动归档到恢复台，线索背包只展示词语和归档位置，不再要求玩家重复填槽位。
- GitHub Actions 构建时使用 `/SpringThief/` base，并从 `public/imgs/` 发布桌面图片资源；本地开发仍使用 `/` base。
- ethers 已由 Vite 打包进主 JS 文件，访问者不需要额外访问 ethers CDN。
- `src/data/challenge.ts` 中的 `flagPayload` 已按当前教学派生地址生成；如果修改固定词组或派生路径，需要重新运行 `scripts/generate_xor_data.mjs`。
- 题目只允许使用练习钱包，不接入真实 NFT、资金、钱包扩展或交易。

## Files

- `src/components/Desktop.tsx`：桌面和模块入口。
- 桌面使用 `public/imgs/壁纸.jpeg` 作为 XP 壁纸，并使用 `public/imgs/图标` 和 `public/imgs/记忆配对` 中的资源；窗口 chrome 参考 `public/imgs/窗口参考图.jpg`。
- 桌面上的 `题目提示.txt` 会以记事本窗口打开，原主页提示已迁移到该文件。
- `src/components/modules/`：档案、搜索、小游戏、解密和钱包恢复模块。
- `src/lib/wallet.ts`：BIP-39/BIP-44 钱包适配层。
- `src/lib/flag.ts`：地址循环异或 flag 解码。
- `docs/superpowers/specs/2026-09-28-chunni-bang-design.md`：设计文档。

拿到最终派生地址后，使用下面的命令生成 24 字节 XOR `data`，再替换 `src/data/challenge.ts` 中的占位值：

```bash
node scripts/generate_xor_data.mjs 0xYour20ByteAddress
```
