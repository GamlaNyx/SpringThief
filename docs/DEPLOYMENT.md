# 春泥棒服务器端口部署指南

本文介绍如何把本项目作为静态网页放到已有的 Ubuntu/Debian 服务器上，并通过单独端口访问，例如 `http://服务器公网IP:8088/`。项目使用 Nginx 提供静态文件，不需要在服务器上运行 Vite/Node 服务，也不会改动其他站点的 Nginx 配置。

> 示例端口使用 `8088`。如果该端口已被占用，请选择其他未使用的高位端口（例如 `18080`），并在下文所有配置和防火墙命令中统一替换。

## 1. 部署结构

```text
做题者浏览器
  |
  | http://服务器公网IP:8088/
  v
服务器防火墙 / 云安全组：允许 TCP 8088
  |
  v
Nginx：listen 8088
  |
  v
/var/www/chunni-bang/current/
  ├── index.html
  ├── assets/
  └── imgs/
```

如果服务器上已有 Nginx，只新增一个监听 `8088` 的站点配置。不要改动现有站点的 `80`、`443` 配置，也不要把 `npm run dev` 暴露到公网。

## 2. 部署前准备

需要准备：

- 服务器的公网 IPv4 地址，例如 `203.0.113.10`；
- 一个可以通过 SSH 登录的服务器账号；
- 服务器运行 Ubuntu/Debian，并已安装 Nginx；
- 服务器云平台的安全组/防火墙配置权限。

本指南用 `8088` 举例。先通过 SSH 登录服务器：

```bash
ssh YOUR_USER@YOUR_SERVER_IP
```

确认 Nginx 正常：

```bash
sudo nginx -t
sudo systemctl status nginx --no-pager
```

## 3. 检查端口并创建目录

检查 `8088` 是否已有程序监听：

```bash
sudo ss -ltnp 'sport = :8088'
```

如果没有输出，通常表示端口空闲。如果看到已有服务，**不要停止它**；改选 `18080` 等端口，并记下新端口，后续步骤全部使用同一个端口。

创建发布目录。命令中的 `YOUR_USER` 换成 SSH 登录用户名：

```bash
sudo mkdir -p /var/www/chunni-bang/releases
sudo chown -R YOUR_USER:YOUR_USER /var/www/chunni-bang
mkdir -p /var/www/chunni-bang/releases/20261007-01
```

`releases/` 保存每次发布的文件，`current` 会指向当前使用的版本，方便回滚。

## 4. 在自己的电脑构建网页

在项目目录运行：

```powershell
cd D:\_projects\fcg\q2-copy
npm ci
npm test
npm run build
```

确认构建成功且 `dist/` 包含 `index.html`、`assets/` 和 `imgs/`：

```powershell
Get-ChildItem .\dist
```

上传的是 `dist/` 里的内容，不是整个源码仓库。不要上传 `node_modules/`、`.env` 或密钥文件。

## 5. 上传到服务器

在本机 PowerShell 执行，替换用户名和服务器 IP：

```powershell
scp -r .\dist\* YOUR_USER@YOUR_SERVER_IP:/var/www/chunni-bang/releases/20261007-01/
```

如果 SSH 首次连接，先核对服务器指纹再确认。上传后重新 SSH 登录服务器，检查文件：

```bash
find /var/www/chunni-bang/releases/20261007-01 -maxdepth 2 -type f | head -30
```

列表中应能看到 `index.html`、`assets` 下的 JS/CSS 文件以及 `imgs` 资源。

将 `current` 指向新版本：

```bash
ln -sfn /var/www/chunni-bang/releases/20261007-01 /var/www/chunni-bang/current
```

## 6. 添加 Nginx 端口配置

创建新的站点配置文件，不要覆盖其他网站配置：

```bash
sudo nano /etc/nginx/sites-available/chunni-bang-8088
```

写入：

```nginx
server {
    listen 8088;
    listen [::]:8088;
    server_name _;

    root /var/www/chunni-bang/current;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location = /index.html {
        add_header Cache-Control "no-store" always;
    }

    location ~* \.(?:js|css|png|jpg|jpeg|gif|webp|ico|svg|woff2?)$ {
        expires 7d;
        add_header Cache-Control "public, max-age=604800, immutable";
        try_files $uri =404;
    }
}
```

启用新配置并检查语法：

```bash
sudo ln -sfn /etc/nginx/sites-available/chunni-bang-8088 /etc/nginx/sites-enabled/chunni-bang-8088
sudo nginx -t
```

只有当 `nginx -t` 显示语法正常后，才平滑重载 Nginx：

```bash
sudo systemctl reload nginx
```

使用 `reload`，不要为了本项目执行 `restart`；reload 会让 Nginx 平滑加载配置，避免中断其他站点。

## 7. 放行服务器端口

必须同时检查服务器本机防火墙和云平台安全组，两处都可能拦截访问。

### 7.1 Ubuntu UFW（如果已启用）

检查状态：

```bash
sudo ufw status
```

只有当状态为 `active` 时才执行：

```bash
sudo ufw allow 8088/tcp
```

不要执行 `ufw disable`，也不要开放不相关端口。

### 7.2 云服务器安全组/云防火墙

登录云平台控制台，在这台服务器绑定的安全组中添加一条**入站**规则：

```text
协议：TCP
端口：8088
来源：0.0.0.0/0（任何公网访客）
```

IPv6 公网访问时还需按云平台要求添加 IPv6 来源规则。安全组只开放题目端口，不要为了方便开放所有端口。

如果比赛只允许校园网或组织成员访问，把来源限制为对应的公网 IP/CIDR，不要使用 `0.0.0.0/0`。

## 8. 验证访问

先在服务器本机检查 Nginx 是否响应：

```bash
curl -I http://127.0.0.1:8088/
curl -I http://127.0.0.1:8088/imgs/壁纸.jpeg
```

预期返回 `HTTP/1.1 200 OK`。然后从自己的电脑浏览器打开：

```text
http://YOUR_SERVER_PUBLIC_IP:8088/
```

如果网页能打开，再把这个地址发给做题者。用浏览器确认桌面壁纸、图标、记忆配对游戏和钱包恢复台都能使用。

## 9. 更新版本和回滚

每次更新使用新的发布目录，例如 `20261008-01`：

1. 本机重新执行 `npm test` 和 `npm run build`；
2. 在服务器创建新发布目录：

```bash
mkdir -p /var/www/chunni-bang/releases/20261008-01
```

3. 从本机上传新的 `dist/*` 到该目录；
4. 在服务器切换链接：

```bash
ln -sfn /var/www/chunni-bang/releases/20261008-01 /var/www/chunni-bang/current
sudo nginx -t
sudo systemctl reload nginx
```

回滚只需把 `current` 指回上一版本：

```bash
ln -sfn /var/www/chunni-bang/releases/20261007-01 /var/www/chunni-bang/current
sudo nginx -t
sudo systemctl reload nginx
```

不要删除 `current` 当前指向的目录。确认新版本正常后再清理旧版本。

## 10. 常见问题

### 浏览器连接超时

按顺序检查：

```bash
sudo ss -ltnp 'sport = :8088'
sudo nginx -t
curl -I http://127.0.0.1:8088/
```

如果服务器本机访问正常、外部访问超时，通常是云安全组或服务器防火墙没有放行 TCP `8088`，或者使用了服务器内网 IP。

### 端口已被占用

选择另一个空闲端口，例如 `18080`，并同时修改 Nginx 的两行 `listen`、UFW 规则、云安全组规则和发给做题者的网址。不要杀掉占用该端口的其他服务。

### Nginx 配置检查失败

先看具体报错，不要重启服务：

```bash
sudo nginx -t
sudo journalctl -u nginx -n 50 --no-pager
```

只检查和修复新建的 `chunni-bang-8088` 配置，不要覆盖其他站点文件。

### HTTP 和 HTTPS

本指南示例地址是 HTTP：`http://IP:8088/`，适合公开题目网页，不应用来传输密码、私钥或其他敏感信息。若希望使用 HTTPS，建议使用自己的域名并通过 Nginx 配置证书；直接用 IP 和任意端口获取受信任证书通常不如域名方案简单。

## 11. 安全注意事项

- 本题是静态网页，flag 与解码逻辑在浏览器端，不应当作秘密保存；熟悉 DevTools 的人可以分析前端资源。
- 不要把真实钱包助记词、私钥、服务器密码、SSH 私钥或云平台密钥放入源码、构建目录或 GitHub。
- 不要公开开放 SSH、数据库或其他管理端口；这里只开放题目使用的一个 TCP 端口。
- 服务器只负责提供静态文件，不需要开放 Node/Vite 开发端口 `5173`。
- 服务器上的其他服务照常保留；如果 Nginx 配置或端口状态不确定，先停下来核对，不要重启或停用其他服务。

## 12. GitHub Pages 备用方案

如果服务器端口不方便开放，仓库仍可通过 GitHub Pages 访问：<https://GamlaNyx.github.io/SpringThief/>。Pages 使用 HTTPS 且不需要管理服务器；部署步骤见仓库 Settings → Pages，Source 选择 **GitHub Actions**。
