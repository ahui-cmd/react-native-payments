global.PaymentRequest = require('react-native-payments').PaymentRequest;

const {AppRegistry} = require('react-native');
const App = require('./App').default;

AppRegistry.registerComponent('PaymentsExample', () => App);
