jest.mock('react', () => ({ Component: class Component {} }), { virtual: true });
jest.mock('react-native', () => ({
  Platform: { OS: 'harmony' },
  NativeModules: {},
  TurboModuleRegistry: { get: jest.fn() },
  DeviceEventEmitter: { addListener: jest.fn(() => ({})), removeSubscription: jest.fn() },
  requireNativeComponent: jest.fn()
}));
const { PaymentRequest, ApplePayButton } = require('../../index');
const { DeviceEventEmitter, TurboModuleRegistry } = require('react-native');
beforeEach(() => { TurboModuleRegistry.get.mockReset(); DeviceEventEmitter.removeSubscription.mockClear(); });
const details = () => ({id: 'order', total: {label: 'Total', amount: {currency: 'CNY', value: '1.00'}}});
const methods = [{supportedMethods: ['apple-pay'], data: {}}];

test('Harmony reports unavailable and closes rejected requests', async () => {
  const request = new PaymentRequest(methods, details(), {requestShipping: true});
  expect(request.id).toBe('order');
  expect(request.shippingAddress).toBe(null);
  expect(request.shippingOption).toBe(null);
  expect(request.shippingType).toBe(null);
  expect(await request.canMakePayments()).toBe(false);
  expect(await PaymentRequest.canMakePaymentsUsingNetworks(['visa'])).toBe(false);
  expect((await request.abort().catch(e => e)).message).toContain('InvalidStateError');
  expect((await request.show().catch(e => e)).message).toContain('NotSupportedError');
  expect(DeviceEventEmitter.removeSubscription).toHaveBeenCalledTimes(2);
  expect((await request.show().catch(e => e)).message).toContain('InvalidStateError');
});

test('Apple Pay native button is unavailable on Harmony', () => {
  expect(() => new ApplePayButton({}).render()).toThrow('NotSupportedError');
});


test('Harmony bridges the server order and returns a response requiring verification', async () => {
  const mockModule = {isAvailable: jest.fn(() => Promise.resolve(true)), pay: jest.fn(() => Promise.resolve('submitted'))};
  TurboModuleRegistry.get.mockReturnValue(mockModule);
  const request = new PaymentRequest([{supportedMethods: ['huawei-pay'], data: {orderStr: 'unit-test-value'}}], details());
  expect(await request.canMakePayments()).toBe(true);
  const response = await request.show();
  expect(mockModule.pay).toHaveBeenCalledWith('unit-test-value');
  expect(response.requestId).toBe('order');
  expect(response.methodName).toBe('huawei-pay');
  expect(response.details).toEqual({status: 'submitted', requiresServerVerification: true});
  expect(response.shippingAddress).toBe(null);
  expect(response.shippingOption).toBe(null);
  expect(response.payerName).toBe(null);
  expect(response.payerPhone).toBe(null);
  expect(response.payerEmail).toBe(null);
  expect(await response.complete('success')).toBe(undefined);
  expect(() => response.complete('success')).toThrow('InvalidStateError');
});

test('Harmony rejects unsupported shipping before calling native payment', async () => {
  const mockModule = {isAvailable: jest.fn(() => Promise.resolve(true)), pay: jest.fn()};
  TurboModuleRegistry.get.mockReturnValue(mockModule);
  const request = new PaymentRequest([{supportedMethods: ['huawei-pay'], data: {orderStr: 'unit-test-value'}}], details(), {requestShipping: true});
  expect(await request.canMakePayments()).toBe(false);
  expect((await request.show().catch(e => e)).message).toContain('NotSupportedError');
  expect(mockModule.pay).not.toHaveBeenCalled();
});

test('native failure rejects and closes the request', async () => {
  const mockModule = {isAvailable: jest.fn(() => Promise.resolve(true)), pay: jest.fn(() => Promise.reject(new Error('payment cancelled')))};
  TurboModuleRegistry.get.mockReturnValue(mockModule);
  const request = new PaymentRequest([{supportedMethods: ['huawei-pay'], data: {orderStr: 'unit-test-value'}}], details());
  expect((await request.show().catch(e => e)).message).toContain('cancelled');
  expect((await request.show().catch(e => e)).message).toContain('InvalidStateError');
});
