# 春泥棒部署指南

本文面向第一次部署网页项目的操作者。项目是 Vite + React 单页应用，生产环境只需要把 `dist/` 静态文件交给 Nginx，不需要在服务器上长期运行 Vite 开发服务器，也不需要占用一个 Node 服务端口。

## 1. 部署前的安全边界

当前题目的 flag、XOR payload 和解码逻辑都在浏览器端。它适合练习赛和招新题，但不能把它当作真正的保密系统。熟悉开发者工具的参赛者可以查看前端代码并复现解码过程。

不要把真实 NFT、真实钱包、真实私钥、云平台密钥或数据库密码放进仓库、`.env`、网页源码或构建产物。本题只使用练习数据。

## 2. 推荐架构

```text
浏览器
  |
  | HTTPS :443
  v
Nginx
  |
  | 独立域名，例如 challenge.example.com
  v
/var/www/chunni-bang/current/dist/index.html
```

如果服务器上已经有其他网站或 API，不要修改它们现有的 `server` 配置。为本题使用独立域名或独立子域名，新增一个 Nginx `server` 块即可。静态文件不会和其他服务争抢 Node 端口。

## 3. 本地构建

在有源码的电脑上执行：

```powershell
cd D:\_projects\fcg\q2-copy
npm install
npm test
npm run build
```

构建成功后，发布目录是 `dist/`。发布前确认：

- `npm test` 没有失败；
- `npm run build` 成功；
- `dist/index.html` 存在；
- `dist/assets/` 中有 JS、CSS 和图片资源；
- 题目中没有放入真实密钥或真实资产。

## 4. 第一次准备服务器

以下示例适用于 Ubuntu/Debian。把 `example.com`、用户名和服务器 IP 换成自己的值。

### 4.1 安装 Nginx 和基础工具

```bash
sudo apt update
sudo apt install -y nginx rsync curl
sudo systemctl enable --now nginx
```

如果服务器已有 Nginx，不要重复安装；先确认状态：

```bash
sudo nginx -t
sudo systemctl status nginx --no-pager
```

### 4.2 创建独立目录

```bash
sudo mkdir -p /var/www/chunni-bang/releases
sudo chown -R "$USER":"$USER" /var/www/chunni-bang
```

这里使用 `releases/` 保存每次发布，`current` 是当前版本的软链接。这样回滚时只需要切换软链接，不用覆盖正在运行的目录。

## 5. 上传构建文件

### 方案 A：从本地上传 `dist/`（推荐）

在 Windows PowerShell 中执行。首次连接会询问是否信任服务器指纹。

```powershell
scp -r .\dist\* user@example.com:/var/www/chunni-bang/releases/20261002-01/
```

如果目标发布目录不存在，先在服务器执行：

```bash
mkdir -p /var/www/chunni-bang/releases/20261002-01
```

上传完成后，在服务器执行：

```bash
ln -sfn /var/www/chunni-bang/releases/20261002-01 /var/www/chunni-bang/current
```

### 方案 B：服务器从 GitHub 拉源码并构建

只有在服务器需要参与构建时才使用这个方案。服务器需要 Node.js LTS 和 Git：

```bash
sudo apt install -y git
git clone https://github.com/OWNER/REPOSITORY.git /var/www/chunni-bang/source
cd /var/www/chunni-bang/source
npm ci
npm test
npm run build
mkdir -p /var/www/chunni-bang/releases/20261002-01
cp -a dist/. /var/www/chunni-bang/releases/20261002-01/
ln -sfn /var/www/chunni-bang/releases/20261002-01 /var/www/chunni-bang/current
```

服务器上不建议运行 `npm run dev`，它是开发服务器，不适合公开暴露。

## 6. 配置 Nginx

创建新配置文件，不要直接覆盖其他站点：

```bash
sudo nano /etc/nginx/sites-available/chunni-bang
```

写入以下内容：

```nginx
server {
    listen 80;
    listen [::]:80;

    server_name challenge.example.com;

    root /var/www/chunni-bang/current;
    index index.html;

    # React/Vite 单页应用需要回退到 index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 不缓存入口文件，避免发布后用户拿到旧的资源清单
    location = /index.html {
        add_header Cache-Control "no-store" always;
    }

    # Vite 生成的带 hash 资源可以长期缓存
    location ~* \.(?:js|css|png|jpg|jpeg|gif|webp|ico|svg|woff2?)$ {
        expires 7d;
        add_header Cache-Control "public, max-age=604800, immutable";
        try_files $uri =404;
    }
}
```

启用配置并检查：

```bash
sudo ln -sfn /etc/nginx/sites-available/chunni-bang /etc/nginx/sites-enabled/chunni-bang
sudo nginx -t
sudo systemctl reload nginx
```

`nginx -t` 必须显示配置语法正常后才能 reload。不要为了修复本题而执行 `systemctl restart nginx`，因为重启可能影响服务器上的其他服务；优先使用平滑的 `reload`。

## 7. DNS 和 HTTPS

在 DNS 服务商处添加：

```text
类型：A
主机记录：challenge
值：服务器公网 IPv4
```

等待 DNS 生效后，用浏览器访问 `http://challenge.example.com`。确认本题正常后再申请 HTTPS：

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d challenge.example.com
```

Certbot 会询问是否跳转 HTTPS，建议选择重定向。续期测试：

```bash
sudo certbot renew --dry-run
```

如果服务器有云防火墙或安全组，还需要放行 TCP `80` 和 `443`；不要开放开发服务器端口 `5173`。

## 8. 发布新版本和回滚

每次发布使用新的目录名，例如：

```bash
mkdir -p /var/www/chunni-bang/releases/20261003-01
# 上传新的 dist/* 到这个目录后执行：
ln -sfn /var/www/chunni-bang/releases/20261003-01 /var/www/chunni-bang/current
sudo nginx -t
sudo systemctl reload nginx
```

查看当前版本：

```bash
readlink -f /var/www/chunni-bang/current
```

回滚到上一版本：

```bash
ln -sfn /var/www/chunni-bang/releases/20261002-01 /var/www/chunni-bang/current
sudo nginx -t
sudo systemctl reload nginx
```

确认新版本稳定后，再清理旧发布目录。不要删除 `current` 指向的目录。

## 9. 部署后检查清单

```bash
curl -I https://challenge.example.com/
curl -I https://challenge.example.com/assets/<某个资源文件>
sudo nginx -t
sudo tail -n 50 /var/log/nginx/error.log
```

浏览器中检查：

1. 首页能打开，壁纸和图标正常显示；
2. 刷新任意路径不会出现 Nginx 404；
3. 档案、浏览器、游戏、解密和恢复台都能打开；
4. 恢复台能依次显示种子、私钥、地址并完成 flag 验证；
5. 地址栏显示 HTTPS，证书没有警告；
6. 其他已有域名和服务仍然正常。

## 10. 常见问题

### 刷新页面出现 404

通常是缺少 `try_files $uri $uri/ /index.html;`。确认该配置位于本题的 `server` 块中，然后执行 `sudo nginx -t && sudo systemctl reload nginx`。

### 页面打开但 JS/CSS 404

检查 `root` 是否指向 `/var/www/chunni-bang/current`，并确认 `current/index.html` 和 `current/assets/` 存在：

```bash
ls -la /var/www/chunni-bang/current
ls -la /var/www/chunni-bang/current/assets
```

### 新版本看起来没有更新

先确认 `current` 已指向新的发布目录，再执行硬刷新。入口文件配置了 `no-store`，带 hash 的旧资源可以安全缓存。

### Nginx reload 失败

不要反复重启。先查看完整错误：

```bash
sudo nginx -t
sudo journalctl -u nginx -n 50 --no-pager
```

常见原因是 `server_name` 重复、括号缺失或端口配置冲突。只修改本题新增的配置文件，避免影响其他站点。

## 11. GitHub 推送流程

当前本地仓库尚未配置 remote。拿到 GitHub 仓库 URL 后执行：

```bash
git remote add origin https://github.com/OWNER/REPOSITORY.git
git branch -M main
git push -u origin main
```

如果仓库启用了双因素认证，HTTPS 推送时不能使用 GitHub 登录密码，应使用 Personal Access Token；也可以改用 SSH remote：

```bash
git remote set-url origin git@github.com:OWNER/REPOSITORY.git
git push -u origin main
```

不要把 Personal Access Token、SSH 私钥或服务器密码写进文档、代码、`.env` 或聊天记录。推送前确认：

```bash
git status --short
git check-ignore -v node_modules dist .env
git log --oneline -1
```

仓库中应该有源码、`imgs/`、测试、文档和 `package-lock.json`，不应该有 `node_modules/`、`dist/`、`.env`、私钥或证书文件。
