# 沙盒测试步骤

签名、证书、指纹、商户与沙盒等相关的华为官网链接，见仓库根目录 [README.md · 使用说明](../README.md#使用说明)。

## 一、华为侧：应用与沙盒材料

1. 在 AppGallery Connect 创建应用，包名与 `harmony/AppScope/app.json5` 的 `bundleName` 一致。
2. 记下该应用的 **APP ID**、**Client ID**。
3. 向华为申请 / 获取沙盒材料：`mercNo`、`authId`、商户私钥、测试账号（及支付密码）；并准备华为能访问的公网 HTTPS `callbackUrl`。

## 二、申请调试证书并配置手动签名（装 HAP 前必做）

本示例需使用**手动签名**（申请调试证书 / Profile，并在 AGC 配置与签名证书一致的公钥指纹），不要用自动签名。

材料分工：`.p12` / `.csr` **本机生成**（私钥在本地，网站下不了）；`.cer` / `.p7b` **网站申请后下载**。三者必须配套使用。

1. 用 DevEco 打开 `example/harmony`，连接真机。
2. **本机生成密钥**：如需统一存放，可先自行新建 `harmony/csr/` 目录。DevEco **Build → Generate Key and CSR**，得到 `.p12`（密钥库）和 `.csr`（证书请求），保存到该目录（或本机任意路径）。后面申请证书要上传这个 `.csr`。
3. **网站下载证书材料**：在 AGC / 开发者中心上传上一步的 `.csr` **申请调试证书**并下载 `.cer`；**登记调试设备**；再申请 **调试 Profile** 并下载 `.p7b`（建议与 `.p12` 放同一目录，如 `harmony/csr/`）。
4. DevEco：**Project Structure → Signing Configs**，填入配套的本机 `.p12` + 下载的 `.cer` / `.p7b` 与密码、别名；结果写入本机 `harmony/build-profile.json5`。
5. **配置公钥指纹**（Payment Kit 需要）：
   - 以 `build-profile.json5` 里 `certpath` 指向的那张 `.cer` 为准计算 SHA256；
   - 到 AGC「应用管理 → 基础信息 → SHA256 证书/公钥指纹」添加**同一串**；
   - **按指纹值核对，不要只按证书名称选择**（同名可能是另一张证）。

也可尝试在 `harmony/csr` 目录用 Node 计算公钥指纹：
```bat
node -e "const fs=require('fs');const c=require('crypto');console.log(new c.X509Certificate(fs.readFileSync('payment.cer')).fingerprint256)"
```

## 三、工程配置

1. 填写 `harmony/entry/src/main/module.json5` 的 `app_id`、`client_id`（AGC 的 APP ID / Client ID）。
2. 填写 `sandbox-merchant/sandbox-config.json`：`appId`、`mercNo`、`authId`、`callbackUrl` 等。
3. 在 `sandbox-merchant/certs/` 新建 `merchant_private_key.pem`（目录里默认只有 `.gitkeep`）：
   - **RSA**：把华为提供的私钥正文写入该文件，并用 PEM 头尾包裹：
     ```text
     -----BEGIN PRIVATE KEY-----
     （中间为私钥内容）
     -----END PRIVATE KEY-----
     ```
   - **SM2**：若邮件给的是 64 位十六进制私钥，则整文件只放这一串 hex（不要加 `BEGIN`/`END`），并先在 `sandbox-merchant` 执行过 `npm install`。

## 四、设备账号

1. 真机 / 模拟器登录与华为提供的**沙盒测试环境**绑定的账号。

## 五、安装与打包

1. 在 `example` 目录执行：`npm run fast:pkg`
2. 在 `sandbox-merchant` 目录执行：`npm install`
3. DevEco 编译安装签名 HAP，或在 `harmony` 目录执行 `hvigorw assembleHap` 后用 `hdc install` 安装。

## 六、生成 orderStr 并支付

1. 在 `example` 执行：`npm run sandbox-order`（打印一整行 orderStr，约 10 分钟有效，含 `sandbox_flag`）。
2. 运行示例应用。
3. 把整行 orderStr 粘贴到示例页支付卡片，点支付。
