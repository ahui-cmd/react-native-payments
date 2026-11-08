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

import { UITurboModule, UITurboModuleContext } from '@rnoh/react-native-openharmony/ts';
import { BusinessError } from '@kit.BasicServicesKit';
import { paymentService } from '@kit.PaymentKit';

export class RNPaymentsModule extends UITurboModule {
  static NAME = 'RNPaymentsHarmony';
  constructor(ctx: UITurboModuleContext) { super(ctx); }
  async isAvailable(): Promise<boolean> {
    return canIUse('SystemCapability.Payment.PaymentService');
  }
  async pay(orderStr: string): Promise<string> {
    if (!orderStr || orderStr.trim().length === 0) throw new Error('A server-generated orderStr is required');
    try {
      await paymentService.requestPayment(this.ctx.uiAbilityContext, orderStr);
    } catch (error) {
      const err = error as BusinessError;
      const detail = `RNPayments pay failed code=${err.code} message=${err.message}`;
      console.error(detail);
      throw new Error(detail);
    }
    // A client callback is not proof of settlement. The merchant must verify its server notification or query.
    return 'submitted';
  }
}
