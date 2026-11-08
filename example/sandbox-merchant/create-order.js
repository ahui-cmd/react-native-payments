'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const CONFIG_PATH = path.join(ROOT, 'sandbox-config.json');
const RESERVED = '{"sandbox_flag": true}';

function fail(message) {
  console.error(message);
  process.exit(1);
}

function readConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    fail(
      [
        '缺少 example/sandbox-merchant/sandbox-config.json。',
        '在该模板中填入华为邮件中的商户号、证书 ID、私钥文件和公网 HTTPS callbackUrl。',
        '私钥只放在 certs 目录，不要放进鸿蒙应用。',
      ].join('\n'),
    );
  }
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  const missing = ['appId', 'mercNo', 'authId', 'privateKeyPath', 'callbackUrl'].filter(key => !String(config[key] || '').trim());
  if (missing.length > 0) fail('sandbox-config.json 还有空项：' + missing.join('、'));
  if (!/^https:\/\//i.test(config.callbackUrl)) fail('callbackUrl 必须是 https 地址');
  const amount = Number(config.totalAmount);
  if (!Number.isInteger(amount) || amount <= 0) fail('totalAmount 必须是大于 0 的整数，单位是分。1.00 元填写 100');
  config.totalAmount = amount;
  config.sandboxHost = config.sandboxHost || 'https://petalpay-developer-sandbox.cloud.huawei.com.cn';
  config.preorderPath = config.preorderPath || '/api/v2/aggr/preorder/create/app';
  config.tradeSummary = config.tradeSummary || '测试商品';
  config.bizType = config.bizType || '100002';
  return config;
}

function canonical(fields) {
  return Object.keys(fields)
    .filter(key => key !== 'sign' && key !== 'headerSign')
    .filter(key => fields[key] !== undefined && fields[key] !== null)
    .sort()
    .map(key => key + '=' + fields[key])
    .join('&');
}

function loadPrivateKey(filePath) {
  const resolved = path.resolve(ROOT, filePath);
  if (!fs.existsSync(resolved)) fail('找不到私钥文件：' + resolved);
  const text = fs.readFileSync(resolved, 'utf8').trim();
  if (text.includes('BEGIN')) {
    const key = crypto.createPrivateKey(text);
    if (key.asymmetricKeyType === 'rsa') return {type: 'rsa', key};
    fail('PEM 私钥不是 RSA。若邮件给出的是 SM2，请把 64 位十六进制私钥单独放进该文件。');
  }
  const hex = text.replace(/\s+/g, '');
  if (/^[0-9a-fA-F]{64}$/.test(hex)) return {type: 'sm2', hex};
  fail('无法识别私钥。RSA 使用 PEM；SM2 使用 64 位十六进制私钥。');
}

function signContent(content, privateKey) {
  if (privateKey.type === 'rsa') {
    return crypto
      .sign('sha256', Buffer.from(content, 'utf8'), {
        key: privateKey.key,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        saltLength: 32,
      })
      .toString('base64');
  }
  let sm2;
  try {
    sm2 = require('sm-crypto').sm2;
  } catch (error) {
    fail('这是 SM2 私钥。请先在 example/sandbox-merchant 执行 npm install。');
  }
  const derHex = sm2.doSignature(content, privateKey.hex, {hash: true, der: true});
  return Buffer.from(derHex, 'hex').toString('base64');
}

function buildPayMercAuth(bodyFields, authId, privateKey) {
  const traceId = crypto.randomBytes(16).toString('hex');
  const headerFields = {
    callerId: bodyFields.mercNo,
    traceId,
    time: Date.now(),
    authId,
    bodySign: signContent(canonical(bodyFields), privateKey),
  };
  return JSON.stringify({
    ...headerFields,
    headerSign: signContent(canonical(headerFields), privateKey),
  });
}

function buildOrderStr(config, prepayId, privateKey) {
  const fields = {
    app_id: config.appId,
    merc_no: config.mercNo,
    prepay_id: prepayId,
    timestamp: String(Date.now()),
    noncestr: crypto.randomBytes(16).toString('hex'),
    auth_id: config.authId,
    reserved: RESERVED,
  };
  fields.sign = signContent(canonical(fields), privateKey);
  return JSON.stringify(fields);
}

async function preorder(config, privateKey) {
  const bodyFields = {
    mercOrderNo: 'pay-example-' + Date.now(),
    appId: config.appId,
    mercNo: config.mercNo,
    tradeSummary: config.tradeSummary,
    bizType: config.bizType,
    totalAmount: config.totalAmount,
    callbackUrl: config.callbackUrl,
  };
  const response = await fetch(new URL(config.preorderPath, config.sandboxHost), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      Accept: 'application/json',
      PayMercAuth: buildPayMercAuth(bodyFields, config.authId, privateKey),
    },
    body: JSON.stringify(bodyFields),
  });
  const text = await response.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch (error) {
    fail('预下单没有返回 JSON，HTTP ' + response.status);
  }
  if (payload.resultCode !== '000000' || !payload.prepayId) {
    fail(
      '预下单未成功：' +
        [payload.resultCode, payload.resultDesc, payload.subCode, payload.subDesc].filter(Boolean).join(' '),
    );
  }
  return payload.prepayId;
}

async function main() {
  const config = readConfig();
  const privateKey = loadPrivateKey(config.privateKeyPath);
  const prepayId = await preorder(config, privateKey);
  console.log(buildOrderStr(config, prepayId, privateKey));
  console.error('上面这一整行就是 orderStr。prepayId 约 10 分钟内有效，粘贴到示例应用后再拉起收银台。');
}

if (require.main === module) {
  main().catch(error => fail(error.message || String(error)));
}

module.exports = {canonical, RESERVED};
