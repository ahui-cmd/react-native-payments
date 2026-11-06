/**
 * MIT License
 *
 * Copyright (C) 2026 Huawei Device Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

#pragma once
#include "RNOH/Package.h"
#include "RNOH/ArkTSTurboModule.h"
namespace rnoh {
class RNPaymentsHarmony : public ArkTSTurboModule {
public:
  RNPaymentsHarmony(const ArkTSTurboModule::Context ctx, const std::string name) : ArkTSTurboModule(ctx, name) {
    methodMap_ = { ARK_ASYNC_METHOD_METADATA(isAvailable, 0), ARK_ASYNC_METHOD_METADATA(pay, 1) };
  }
};
class RNPaymentsFactory : public TurboModuleFactoryDelegate {
public:
  SharedTurboModule createTurboModule(Context ctx, const std::string &name) const override {
    return name == "RNPaymentsHarmony" ? std::make_shared<RNPaymentsHarmony>(ctx, name) : nullptr;
  }
};
class RNPaymentsPackage : public Package {
public:
  using Package::Package;
  std::unique_ptr<TurboModuleFactoryDelegate> createTurboModuleFactoryDelegate() override {
    return std::make_unique<RNPaymentsFactory>();
  }
};
}
