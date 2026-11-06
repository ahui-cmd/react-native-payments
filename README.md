> 文档模板：v0.4.2

<p align="center">
  <h1 align="center"> <code>react-native-payments</code> </h1>
</p>

本项目基于 [react-native-payments](https://github.com/naoufal/react-native-payments) 开发。

该第三方库支持直接从 npm 下载，新的包名为：`@react-native-ohos/react-native-payments`，版本所属关系如下：

| 三方库名称 | 三方库版本（npm地址） | 发布信息 | 支持RN版本 | Autolink | 编译API版本 | 社区基线版本 | 源码地址 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| @react-native-ohos/react-native-payments | [~0.8.4 (开发中)](https://www.npmjs.com/package/@react-native-ohos/react-native-payments) | [GitHub Releases](https://github.com/react-native-oh-library/react-native-payments/releases) | 0.72.* / 0.77.* / 0.82.* / 0.84.* | 是 | API12 | 0.8.3 | [master](https://github.com/react-native-oh-library/react-native-payments/tree/master) |

## 简介

react-native-payments 提供 Payment Request 风格的支付接口。HarmonyOS 适配通过 RNOH TurboModule 调用华为 Payment Kit，支持使用商户服务端生成的 `orderStr` 拉起基础支付收银台。

## 下载安装

进入到工程目录并输入以下命令：

**npm**

```bash
npm install @react-native-ohos/react-native-payments
```

**yarn**

```bash
yarn add @react-native-ohos/react-native-payments
```

## Link

|                                      | 是否支持Autolink | RN框架版本 |
|--------------------------------------|----------------|-----------|
| ~ 0.8.4                              | 是           |  0.72.* / 0.77.* / 0.82.* / 0.84.*     |

使用 Autolink 的工程需要根据该文档配置，Autolink 框架指导文档：https://atomgit.com/CPF-RN/ohos_react_native/blob/master/docs/zh-cn/Autolinking.md

如您使用的版本支持 Autolink，并且工程已接入 Autolink，可跳过 ManualLink 配置。应用包名、`app_id`、`client_id` 和网络权限仍按下方 [权限要求](#权限要求) 配置。

<details>
  <summary>ManualLink: 此步骤为手动配置原生依赖项的指导</summary>

首先需要使用 DevEco Studio 打开项目里的 OpenHarmony 工程 `harmony`。

### 1. Overrides RN SDK

为了让工程依赖同一个版本的 RN SDK，需要在工程根目录的 `oh-package.json5` 添加 overrides 字段，指向工程需要使用的 RN SDK 版本。替换的版本既可以是一个具体的版本号，也可以是一个模糊版本，还可以是本地存在的 HAR 包或源码目录。

关于该字段的作用请阅读[官方说明](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/ide-oh-package-json5-V5#zh-cn_topic_0000001792256137_overrides)。

```json
{
  "overrides": {
    "@rnoh/react-native-openharmony" : "file:../node_modules/@react-native-oh/react-native-harmony/react_native_openharmony.har" // 指向本地 har 包的路径
    // "@rnoh/react-native-openharmony": "~0.72.38" // ohpm 在线版本
    // "@rnoh/react-native-openharmony" : "./react_native_openharmony" // 指向源码路径
  }
}
```

### 2. 引入原生端代码

目前有两种方法：

- 通过 har 包引入。
- 直接链接源码。

方法一：通过 har 包引入（推荐）

> [!TIP] har 包位于三方库安装路径的 `harmony` 文件夹下。

打开 `entry/oh-package.json5`，添加以下依赖：

```json
"dependencies": {
    "@react-native-ohos/react-native-payments": "file:../../node_modules/@react-native-ohos/react-native-payments/harmony/rn_payments"
  }
```

点击右上角的 `sync` 按钮

或者在命令行终端执行：

```bash
cd entry
ohpm install
```

方法二：直接链接源码

> [!TIP] 如需使用直接链接源码，请参考[直接链接源码说明](https://atomgit.com/CPF-RN/usage-docs/blob/master/zh-cn/link-source-code.md)。

### 3. 配置 CMakeLists 和引入 RNPaymentsPackage

打开 `entry/src/main/cpp/CMakeLists.txt`，添加：

```diff
add_subdirectory("${RNOH_CPP_DIR}" ./rn)
+ add_subdirectory("${OH_MODULES}/@react-native-ohos/react-native-payments/src/main/cpp" ./rn_payments)

target_link_libraries(rnoh_app PUBLIC rnoh)
+ target_link_libraries(rnoh_app PUBLIC rnoh_payments)
```

打开 `entry/src/main/cpp/PackageProvider.cpp`，添加：

```diff
#include "RNOH/PackageProvider.h"
+ #include "RNPaymentsPackage.h"

using namespace rnoh;

std::vector<std::shared_ptr<Package>> PackageProvider::getPackages(Package::Context ctx) {
    return {
+     std::make_shared<RNPaymentsPackage>(ctx)
    };
}
```

### 4. 在 ArkTs 侧引入 RNPaymentsPackage

打开 `entry/src/main/ets/RNPackagesFactory.ets`，添加：

```diff
  ...
+ import { RNPaymentsPackage } from '@react-native-ohos/react-native-payments';

export function createRNPackages(ctx: RNPackageContext): RNPackage[] {
  return [
+    new RNPaymentsPackage(ctx)
  ];
}
```

### 5. 配置宿主应用的 AGC 身份与网络权限

见下方 [权限要求](#权限要求)。

</details>

### 运行

点击右上角的 `sync` 按钮

或者在命令行终端执行：

```bash
cd entry
ohpm install
```

然后编译、运行即可。

## 约束与限制

### 兼容性

本文档内容基于以下版本验证通过：

1. RNOH: 0.72.96; SDK: HarmonyOS 6.0.0 Release SDK; IDE: DevEco Studio 6.0.0.858; ROM: 6.0.0.112;
2. RNOH: 0.77.18; SDK: HarmonyOS 6.0.0 Release SDK; IDE: DevEco Studio 6.0.0.858; ROM: 6.0.0.112;
3. RNOH: 0.82.1; SDK: HarmonyOS 6.0.1 Release SDK; IDE: DevEco Studio 6.0.1 Release; ROM: 6.0.0.120 SP7;
4. RNOH: 0.84.1; SDK: HarmonyOS 6.0.1 Release SDK; IDE: DevEco Studio 6.0.1 Release; ROM: 6.0.0.120 SP7;

### 权限要求

拉起收银台前，宿主应用的包名、`app_id`、`client_id` 要和 AppGallery Connect 里的应用一致，并声明网络权限。签名、证书指纹和商户配置见 [使用说明](#使用说明)。

`AppScope/app.json5`：

```json
{
  "app": {
    "bundleName": "与 AGC 应用包名一致"
  }
}
```

`entry/src/main/module.json5` 的 `module` 中增加 `metadata` 和 `requestPermissions`。`abilities` 改成宿主的主 Ability 名称：

```json
{
  "module": {
    "metadata": [
      {
        "name": "app_id",
        "value": "AGC 项目设置 > 常规 中的 APP ID"
      },
      {
        "name": "client_id",
        "value": "同一页面的 OAuth 2.0 客户端 ID（Client ID）"
      }
    ],
    "requestPermissions": [
      {
        "name": "ohos.permission.INTERNET",
        "usedScene": {
          "abilities": [
            "EntryAbility"
          ],
          "when": "always"
        }
      }
    ]
  }
}
```

## 使用示例

下面的代码展示了这个库的基本使用场景：

> [!WARNING] 使用时 import 的库名不变。

```javascript
import * as React from "react";
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { PaymentRequest } from "react-native-payments";

const orderStr = "";

const buildRequest = () =>
  new PaymentRequest(
    [{ supportedMethods: ["huawei-pay"], data: { orderStr } }],
    { id: "demo-order", total: { label: "总计", amount: { currency: "CNY", value: "1.00" } } },
  );

const Line = ({ name, value }: { name: string; value: unknown }) => (
  <View style={{ marginBottom: 16 }}>
    <Text style={{ textDecorationLine: "underline", fontWeight: "500" }}>{name}</Text>
    <Text>{JSON.stringify(value, null, 2)}</Text>
  </View>
);

export default function PaymentsDemo() {
  const [status, setStatus] = React.useState("");

  React.useEffect(() => {
    buildRequest()
      .canMakePayments()
      .then((available) => setStatus(`canMakePayments: ${available}`))
      .catch((e) => setStatus(`canMakePayments error: ${e?.message ?? e}`));
  }, []);

  const onShow = async () => {
    try {
      const response = await buildRequest().show();
      setStatus(`show() ok: ${JSON.stringify(response)}`);
      await response.complete("unknown");
      setStatus("complete ok");
    } catch (e: any) {
      setStatus(`show error: ${e?.message ?? e}`);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Line name="orderStr" value={orderStr} />
        <Line name="paymentStatus" value={status} />
        <TouchableOpacity onPress={onShow}>
          <Text style={{ color: "#007AFF", fontWeight: "500" }}>show() 发起支付</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

```

## 使用说明

使用本库前，按下面的华为文档完成签名、证书指纹、商户和沙盒准备（Payment Kit 需**手动签名**并配置公钥指纹）：

- [配置调试签名](https://developer.huawei.com/consumer/cn/doc/doccenter-deveco-studio/ide-signing)
- [手动签名](https://developer.huawei.com/consumer/cn/doc/doccenter-deveco-studio/ide-signing-manual)
- [申请调试证书](https://developer.huawei.com/consumer/cn/doc/doccenter-getting-started/agc-help-debug-cert-0000002283256797)
- [注册调试设备](https://developer.huawei.com/consumer/cn/doc/doccenter-getting-started/agc-help-add-device-0000002283189937)
- [申请调试 Profile](https://developer.huawei.com/consumer/cn/doc/doccenter-getting-started/agc-help-debug-profile-0000002248181278)
- [配置公钥指纹](https://developer.huawei.com/consumer/cn/doc/doccenter-getting-started/agc-help-cert-fingerprint-0000002278002933)
- [开发准备](https://developer.huawei.com/consumer/cn/doc/harmonyOS-Guides/payment-preparations)
- [商户基础支付场景](https://developer.huawei.com/consumer/cn/doc/harmonyOS-Guides/payment-payment-process)
- [沙盒环境验证](https://developer.huawei.com/consumer/cn/doc/harmonyOS-Guides/payment-sandbox-test)

## 接口说明

> [!TIP] "平台"列表示该属性在原三方库上支持的平台。

> [!TIP] "OpenHarmony平台支持"列为 "是" 表示 OpenHarmony 平台支持该属性；"否" 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

### 组件

| 名称 | 参数类型 | 必填 | 平台 | OpenHarmony平台支持 | 描述 |
| --- | --- | --- | --- | --- | --- |
| ApplePayButton | [ApplePayButtonProps](#ApplePayButtonProps) | 否 | iOS | 否 | Apple Pay 原生按钮，用于发起支付或提示用户添加卡片。 |

### 属性

#### PaymentRequest

| 名称 | 参数类型 | 默认值 | 必填 | 平台 | OpenHarmony平台支持 | 描述 |
| --- | --- | --- | --- | --- | --- | --- |
| id | string | 未传 `details.id` 时自动生成 | 否 | iOS / Android | 是 | 支付请求标识，对应 `details.id` |
| shippingAddress | PaymentAddress \| null | null | 否 | iOS / Android | 否 | 用户提供的配送地址 |
| shippingOption | string \| null | null | 否 | iOS | 否 | 用户选中的配送选项标识 |
| shippingType | string \| null | null | 否 | iOS | 否 | 配送类型：`shipping`、`delivery` 或 `pickup` |

#### PaymentResponse

| 名称 | 参数类型 | 默认值 | 必填 | 平台 | OpenHarmony平台支持 | 描述 |
| --- | --- | --- | --- | --- | --- | --- |
| requestId | string | 与 `PaymentRequest.id` 相同 | 否 | iOS / Android | 是 | 支付请求标识，取自 `PaymentRequest.id` |
| methodName | string | huawei-pay | 否 | iOS / Android | 是 | 支付方式名称，值为 `huawei-pay` |
| details | object | `show()` 成功后写入 | 否 | iOS / Android | partially | 支付结果。仅含 `status: 'submitted'` 与 `requiresServerVerification: true`，不含 `paymentData`、`paymentToken` 或 `getPaymentToken` |
| shippingAddress | PaymentAddress \| null | null | 否 | iOS / Android | 否 | 配送地址 |
| shippingOption | string \| null | null | 否 | iOS | 否 | 选中的配送选项标识 |
| payerName | string \| null | null | 否 | iOS / Android | 否 | 付款人姓名 |
| payerPhone | string \| null | null | 否 | iOS / Android | 否 | 付款人电话 |
| payerEmail | string \| null | null | 否 | iOS / Android | 否 | 付款人邮箱 |

#### PaymentRequestUpdateEvent

| 名称 | 参数类型 | 默认值 | 必填 | 平台 | OpenHarmony平台支持 | 描述 |
| --- | --- | --- | --- | --- | --- | --- |
| name | string | / | 否 | iOS | 否 | 事件名：`shippingaddresschange` 或 `shippingoptionchange` |
| target | PaymentRequest | / | 否 | iOS | 否 | 发生变更的 `PaymentRequest` |

#### ApplePayButtonProps

| 名称 | 参数类型 | 默认值 | 必填 | 平台 | OpenHarmony平台支持 | 描述 |
| --- | --- | --- | --- | --- | --- | --- |
| type | 'plain' / 'buy' / 'setUp' / 'inStore' / 'donate' | / | 是 | iOS | 否 | 按钮文案。`plain` 仅标志，`buy` 为购买，`setUp` 为添加卡片，`inStore` 为支付，`donate` 为捐赠 |
| style | 'white' / 'whiteOutline' / 'black' | / | 是 | iOS | 否 | 按钮外观：`white`、`whiteOutline` 或 `black` |
| onPress | function | / | 是 | iOS | 否 | 点击回调 |
| width | number | / | 否 | iOS | 否 | 按钮宽度 |
| height | number | 44 | 否 | iOS | 否 | 按钮高度 |
| cornerRadius | number | 4 | 否 | iOS | 否 | 按钮圆角 |

### API

| 名称 | 类型 | 参数类型 | 返回值 | 必填 | 平台 | OpenHarmony平台支持 | 描述 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| show | function | / | Promise\<PaymentResponse\> | 否 | iOS / Android | partially | 用服务端 `orderStr` 拉起收银台，用户确认后返回 `PaymentResponse`。成功时 `details.status` 固定为 `submitted`，不能作为结算结果。请求付款人或配送信息时抛出 `NotSupportedError` |
| canMakePayments | function | / | Promise\<boolean\> | 否 | iOS / Android | partially | 只检查桥接、`PaymentService` 系统能力与 `orderStr` 是否存在，不校验订单有效性，也不检查用户是否已绑卡。请求付款人或配送信息时返回 `false` |
| canMakePaymentsUsingNetworks | function | networks | Promise\<boolean\> | 否 | iOS | 否 | 静态方法。判断 Apple Pay 中是否有与传入卡组织匹配的卡片 |
| abort | function | / | Promise\<void\> | 否 | iOS | 否 | 关闭支付界面 |
| addEventListener | function | eventName, fn | void | 否 | iOS | 否 | 注册 `shippingaddresschange` 或 `shippingoptionchange` 回调 |
| updateWith | function | details | Promise\<void\> | 否 | iOS | 否 | 用新的支付明细更新当前请求 |
| complete | function | paymentStatus | Promise\<void\> | 否 | iOS / Android | 是 | 按 `success`、`fail` 或 `unknown` 结束本次响应 |

## 遗留问题

无

## 其他

`paymentResponse.complete` 与安卓行为一致：支付界面会自己关闭，可以不调用。需要调用时，`paymentStatus` 传 `success`、`fail`、`unknown` 中的一个即可。

## 目录结构

```text
/react-native-payments                         # 项目根目录
├── harmony                                    # 鸿蒙原生适配
│   ├── rn_payments.har                        # har 包
│   └── rn_payments                            # 鸿蒙适配核心代码
│       ├── Index.ets                          # ArkTS 导出入口
│       ├── oh-package.json5                   # ohpm 包描述
│       ├── hvigorfile.ts                      # 模块构建脚本
│       ├── build-profile.json5                # 模块构建配置
│       └── src/main
│           ├── ets
│           │   ├── RNPaymentsPackage.ets      # ArkTS Package
│           │   └── RNPaymentsModule.ets       # TurboModule，调用 Payment Kit
│           └── cpp
│               ├── CMakeLists.txt             # C++ 构建配置，目标 rnoh_payments
│               ├── RNPaymentsPackage.h
│               └── RNPaymentsPackage.cpp
├── js                                         # JS 接口及测试
├── example                                    # 示例 demo
├── jest                                       # Jest 配置与用例
├── buildEnv.sh                                # 构建目录配置
├── package.json                               # npm 包描述
├── CHANGELOG.md                               # 变更记录
├── COMMITTERS.md                              # 提交者
├── LICENSE                                    # 开源协议
├── OAT.xml                                    # 开源审查配置
├── README.OpenSource                          # 开源软件说明
├── README.md                                  # 中文文档
└── README_en.md                               # 英文文档
```

## 贡献代码

使用过程中发现任何问题都可以提交 [Issue](https://github.com/react-native-oh-library/react-native-payments/issues)，当然，也非常欢迎提交 [PR](https://github.com/react-native-oh-library/react-native-payments/pulls)。

## 开源协议

本项目基于 [MIT License](https://github.com/naoufal/react-native-payments/blob/master/LICENSE)，请自由地享受和参与开源。
