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

const {PaymentRequest, ApplePayButton} = require('../../js');
const {TurboModuleRegistry} = require('react-native');

const details = () => ({id: 'order', total: {label: 'Total', amount: {currency: 'CNY', value: '1.00'}}});

function nativeModule(overrides) {
  return Object.assign(
    {
      isAvailable: jest.fn(() => Promise.resolve(true)),
      pay: jest.fn(() => Promise.resolve('submitted')),
    },
    overrides,
  );
}

beforeEach(() => {
  TurboModuleRegistry.get.mockReset();
});

describe('Harmony PaymentRequest', () => {
  it('rejects Apple Pay and shipping requests before native payment', async () => {
    const request = new PaymentRequest([{supportedMethods: ['apple-pay'], data: {}}], details(), {requestShipping: true});
    expect(request.id).toBe('order');
    expect(request.shippingAddress).toBe(null);
    expect(request.shippingOption).toBe(null);
    expect(request.shippingType).toBe(null);
    expect(await request.canMakePayments()).toBe(false);
    expect(await PaymentRequest.canMakePaymentsUsingNetworks(['visa'])).toBe(false);
    expect((await request.abort().catch(e => e)).message).toContain('InvalidStateError');
    expect((await request.show().catch(e => e)).message).toContain('NotSupportedError');
    expect((await request.show().catch(e => e)).message).toContain('InvalidStateError');
  });

  it('returns false when orderStr is missing or Payment Kit is unavailable', async () => {
    TurboModuleRegistry.get.mockReturnValue(nativeModule());
    const empty = new PaymentRequest([{supportedMethods: ['huawei-pay'], data: {}}], details());
    expect(await empty.canMakePayments()).toBe(false);
    expect((await empty.show().catch(e => e)).message).toContain('NotSupportedError');

    TurboModuleRegistry.get.mockReturnValue(nativeModule({isAvailable: jest.fn(() => Promise.resolve(false))}));
    const unavailable = new PaymentRequest([{supportedMethods: ['huawei-pay'], data: {orderStr: 'order'}}], details());
    expect(await unavailable.canMakePayments()).toBe(false);
  });

  it('pays with orderStr and requires server verification', async () => {
    const module = nativeModule();
    TurboModuleRegistry.get.mockReturnValue(module);
    const request = new PaymentRequest([{supportedMethods: ['huawei-pay'], data: {orderStr: 'unit-test-value'}}], details());
    expect(await request.canMakePayments()).toBe(true);
    const response = await request.show();
    expect(module.pay).toHaveBeenCalledWith('unit-test-value');
    expect(response.requestId).toBe('order');
    expect(response.methodName).toBe('huawei-pay');
    expect(response.details).toEqual({status: 'submitted', requiresServerVerification: true});
    expect(response.shippingAddress).toBe(null);
    expect(response.payerName).toBe(null);
    expect(response.payerPhone).toBe(null);
    expect(response.payerEmail).toBe(null);
    expect(await response.complete('unknown')).toBe(undefined);
    expect(() => response.complete('success')).toThrow('InvalidStateError');
  });

  it('rejects payer and shipping options without calling native pay', async () => {
    const module = nativeModule();
    TurboModuleRegistry.get.mockReturnValue(module);
    const options = {requestPayerName: true, requestPayerPhone: true, requestPayerEmail: true};
    const request = new PaymentRequest([{supportedMethods: ['huawei-pay'], data: {orderStr: 'unit-test-value'}}], details(), options);
    expect(await request.canMakePayments()).toBe(false);
    expect((await request.show().catch(e => e)).message).toContain('NotSupportedError');
    expect(module.pay).not.toHaveBeenCalled();
  });

  it('closes the request when native pay fails', async () => {
    TurboModuleRegistry.get.mockReturnValue(nativeModule({pay: jest.fn(() => Promise.reject(new Error('payment cancelled')))}));
    const request = new PaymentRequest([{supportedMethods: ['huawei-pay'], data: {orderStr: 'unit-test-value'}}], details());
    expect((await request.show().catch(e => e)).message).toContain('cancelled');
    expect((await request.show().catch(e => e)).message).toContain('InvalidStateError');
  });

  it('does not provide an Apple Pay button', () => {
    expect(() => new ApplePayButton({}).render()).toThrow('NotSupportedError');
  });

  it('rejects an invalid payment request before calling native pay', () => {
    expect(() => new PaymentRequest([], details())).toThrow('At least one payment method');
    expect(() => new PaymentRequest([{supportedMethods: 'huawei-pay'}], details())).toThrow('not iterable');
    expect(() => new PaymentRequest([{supportedMethods: []}], details())).toThrow('at least one payment method identifier');
    expect(() => new PaymentRequest([{supportedMethods: ['huawei-pay']}], {id: 'order'})).toThrow('total is undefined');
    expect(() => new PaymentRequest([{supportedMethods: ['huawei-pay']}], {id: 'order', total: {label: 'Total', amount: {currency: 'CNY', value: '-1'}}})).toThrow('non-negative');
    expect(() => new PaymentRequest([{supportedMethods: ['huawei-pay']}], {id: 'order', total: {label: 'Total', amount: {currency: 'CNY', value: '1.'}}})).toThrow('not a valid amount');
  });

  it('accepts numeric totals, display items, and checks shipping options', () => {
    TurboModuleRegistry.get.mockReturnValue(nativeModule());
    const request = new PaymentRequest(
      [{supportedMethods: ['huawei-pay'], data: {orderStr: 'order'}}],
      {
        id: 'order',
        total: {label: 'Total', amount: {currency: 'CNY', value: 1}},
        displayItems: [{label: 'Goods', amount: {currency: 'CNY', value: '1.00'}}],
        shippingOptions: [{id: 'standard', label: 'Standard', amount: {currency: 'CNY', value: '0.00'}}],
      },
    );
    expect(request.id).toBe('order');
    expect(() => new PaymentRequest([{supportedMethods: ['huawei-pay']}], {
      id: 'order',
      total: {label: 'Total', amount: {currency: 'CNY', value: '1.00'}},
      displayItems: [{label: 'Goods', amount: {currency: 'CNY'}}],
    })).toThrow('value is undefined');
    expect(() => new PaymentRequest([{supportedMethods: ['huawei-pay']}], {
      id: 'order',
      total: {label: 'Total', amount: {currency: 'CNY', value: '1.00'}},
      shippingOptions: {id: 'bad'},
    })).toThrow('not callable');
  });

  it('treats a blank orderStr or a failed availability check as unavailable', async () => {
    TurboModuleRegistry.get.mockReturnValue(nativeModule());
    const blank = new PaymentRequest([{supportedMethods: ['huawei-pay'], data: {orderStr: '   '}}], details());
    expect(await blank.canMakePayments()).toBe(false);

    TurboModuleRegistry.get.mockReturnValue(nativeModule({isAvailable: jest.fn(() => Promise.reject(new Error('bridge down')))}));
    const failed = new PaymentRequest([{supportedMethods: ['huawei-pay'], data: {orderStr: 'order'}}], details());
    expect(await failed.canMakePayments()).toBe(false);
  });

  it('stores shipping listeners and reads the empty shipping option', async () => {
    TurboModuleRegistry.get.mockReturnValue(nativeModule());
    const request = new PaymentRequest([{supportedMethods: ['huawei-pay'], data: {orderStr: 'order'}}], details());
    const listener = jest.fn();
    expect(typeof request.addEventListener('shippingaddresschange', listener)).toBe('function');
    expect(typeof request.addEventListener('shippingoptionchange', listener)).toBe('function');
    const response = await request.show();
    expect(response.shippingOption).toBe(null);
    expect(await response.complete('fail')).toBe(undefined);
  });

  it('rejects abort, detail updates, and Android wallet lookup on Harmony', async () => {
    const NativePayments = require('../../js/NativeBridge').default;
    let finishPay;
    TurboModuleRegistry.get.mockReturnValue(nativeModule({
      pay: jest.fn(() => new Promise(resolve => { finishPay = resolve; })),
    }));
    const request = new PaymentRequest([{supportedMethods: ['huawei-pay'], data: {orderStr: 'order'}}], details());
    const pending = request.show();
    expect((await request.abort().catch(e => e)).message).toContain('InvalidStateError');
    finishPay('submitted');
    await pending;
    expect((await NativePayments.handleDetailsUpdate({}).catch(e => e)).message).toContain('NotSupportedError');
    expect((await NativePayments.getFullWalletAndroid('id', {}, {}).catch(e => e)).message).toContain('only available on Android');
  });
});
