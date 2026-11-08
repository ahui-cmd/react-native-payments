import { RNPackageContext, RNPackage } from '@rnoh/react-native-openharmony/ts';
import { RNPaymentsPackage } from '@react-native-ohos/react-native-payments';
export function createRNPackages(ctx: RNPackageContext): RNPackage[] { return [new RNPaymentsPackage(ctx)]; }
