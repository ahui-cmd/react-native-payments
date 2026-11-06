// @flow

import type { PaymentDetailsBase, PaymentComplete } from './types';

import { NativeModules, Platform, TurboModuleRegistry } from 'react-native';
const { ReactNativePayments } = NativeModules;

const IS_ANDROID = Platform.OS === 'android';
const IS_HARMONY = Platform.OS === 'harmony';
const unsupported = () => new Error('NotSupportedError: HarmonyOS payment service or huawei-pay orderStr is unavailable.');
const harmonyModule = () => TurboModuleRegistry && TurboModuleRegistry.get('RNPaymentsHarmony');

const NativePayments: {
  canMakePayments: boolean,
  canMakePaymentsUsingNetworks: boolean,
  supportedGateways: Array<string>,
  createPaymentRequest: PaymentDetailsBase => Promise<any>,
  handleDetailsUpdate: PaymentDetailsBase => Promise<any>,
  show: () => Promise<any>,
  abort: () => Promise<any>,
  complete: PaymentComplete => Promise<any>,
  getFullWalletAndroid: string => Promise<any>
} = {
  supportedGateways: IS_ANDROID
    ? ['stripe', 'braintree'] // On Android, Payment Gateways are supported out of the gate.
    : ReactNativePayments ? ReactNativePayments.supportedGateways : [],

  canMakePayments(methodData: object) {
    if (IS_HARMONY) {
      const module = harmonyModule();
      if (!module || !methodData || typeof methodData.orderStr !== 'string' || !methodData.orderStr.trim()) return Promise.resolve(false);
      return module.isAvailable().catch(() => false);
    }
    return new Promise((resolve, reject) => {
      if (IS_ANDROID) {
        ReactNativePayments.canMakePayments(
          methodData,
          (err) => reject(err),
          (canMakePayments) => resolve(true)
        );

        return;
      }

      // On iOS, canMakePayments is exposed as a constant.
      resolve(ReactNativePayments.canMakePayments);
    });
  },

  // TODO based on Naoufal's talk on YouTube the intention of canMakePayments is for it to work like this, so I'm thinking we can integrate Yegor's code into canMakePayments.
  // NF 2020-11-18
  canMakePaymentsUsingNetworks(usingNetworks: []) {
    if (IS_HARMONY) return Promise.resolve(false);
    // IOS method to check that user has available cards at Apple Pay
    // https://developer.apple.com/documentation/passkit/pkpaymentauthorizationviewcontroller/1616187-canmakepaymentsusingnetworks?language=occ

    return new Promise((resolve) => {
      if (IS_ANDROID) {
        resolve(false);
      }

      ReactNativePayments.canMakePaymentsUsingNetworks(
        usingNetworks,
        (err, data) => resolve(data)
      );
    });
  },

  createPaymentRequest(methodData, details, options = {}) {
    if (IS_HARMONY) return Promise.resolve();
    return new Promise((resolve, reject) => {
      // Android Pay doesn't a PaymentRequest interface on the
      // Java side.  So we create and show Android Pay when
      // the user calls `.show`.
      if (IS_ANDROID) {
        return resolve();
      }

      ReactNativePayments.createPaymentRequest(
        methodData,
        details,
        options,
        err => {
          if (err) return reject(err);

          resolve();
        }
      );
    });
  },

  handleDetailsUpdate(details) {
    if (IS_HARMONY) return Promise.reject(unsupported());
    return new Promise((resolve, reject) => {
      // Android doesn't have display items, so we noop.
      // Users need to create a new Payment Request if they
      // need to update pricing.
      if (IS_ANDROID) {
        resolve(undefined);

        return;
      }

      ReactNativePayments.handleDetailsUpdate(details, err => {
        if (err) return reject(err);

        resolve();
      });
    });
  },

  show(methodData, details, options = {}) {
    if (IS_HARMONY) {
      const module = harmonyModule();
      if (!module || !methodData || typeof methodData.orderStr !== 'string' || !methodData.orderStr.trim()) return Promise.reject(unsupported());
      if (options.requestShipping || options.requestPayerName || options.requestPayerPhone || options.requestPayerEmail) {
        return Promise.reject(new Error('NotSupportedError: Payment Kit does not provide shipping or payer details through this bridge.'));
      }
      return module.pay(methodData.orderStr);
    }
    return new Promise((resolve, reject) => {
      if (IS_ANDROID) {
        ReactNativePayments.show(
          methodData,
          details,
          options,
          (err) => reject(err),
          (...args) => { console.log(args); resolve(true) }
        );

        return;
      }

      ReactNativePayments.show((err, paymentToken) => {
        if (err) return reject(err);

        resolve(true);
      });
    });
  },

  abort() {
    if (IS_HARMONY) return Promise.reject(unsupported());
    return new Promise((resolve, reject) => {
      if (IS_ANDROID) {
        // TODO
        resolve(undefined);

        return;
      }

      ReactNativePayments.abort(err => {
        if (err) return reject(err);

        resolve(true);
      });
    });
  },

  complete(paymentStatus) {
    if (IS_HARMONY) return Promise.resolve();
    return new Promise((resolve, reject) => {
      // Android doesn't have a loading state, so we noop.
      if (IS_ANDROID) {
        resolve(undefined);

        return;
      }

      ReactNativePayments.complete(paymentStatus, err => {
        if (err) return reject(err);

        resolve(true);
      });
    });
  },

  getFullWalletAndroid(googleTransactionId: string, paymentMethodData: object, details: object): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!IS_ANDROID) {
        reject(new Error('This method is only available on Android.'));

        return;
      }

      ReactNativePayments.getFullWalletAndroid(
        googleTransactionId,
        paymentMethodData,
        details,
        (err) => reject(err),
        (serializedPaymentToken) => resolve({
          serializedPaymentToken,
          paymentToken: JSON.parse(serializedPaymentToken),
          /** Leave previous typo in order not to create a breaking change **/
          serializedPaymenToken: serializedPaymentToken,
          paymenToken: JSON.parse(serializedPaymentToken)
        })
      );
    });
  }
};

export default NativePayments;
