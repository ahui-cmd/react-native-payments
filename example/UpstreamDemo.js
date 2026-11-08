import React from 'react';
import {ScrollView, StyleSheet, Text, TouchableHighlight, View} from 'react-native';
import Header from './upstream/components/Header';
import {baseTextStyles} from './upstream/styles';
import {
  dynamicShipping,
  errorDuplicateShippingOptionsId,
  errorGatewayNotSupported,
  errorInvalidDisplayItemAmount,
  errorInvalidShippingOptionsAmount,
  errorInvalidTotalAmount,
  errorNegativeTotal,
  errorNoShippingOptions,
  errorNoTotal,
  noInternationalShipping,
  oneItem,
  requestPayerAll,
  requestPayerEmail,
  requestPayerName,
  requestPayerPhone,
  staticShipping,
  twoItems,
  twoItemsPlusTax,
} from './upstream/handlers';

const ORDER_SUMMARY_EXAMPLES = [
  {label: 'One Item', handlePress: oneItem},
  {label: 'Two Items', handlePress: twoItems},
  {label: 'Two Items + Tax', handlePress: twoItemsPlusTax},
];

const CONTACT_INFO_EXAMPLES = [
  {label: 'Request Payer Name', handlePress: requestPayerName},
  {label: 'Request Payer Phone', handlePress: requestPayerPhone},
  {label: 'Request Payer Email', handlePress: requestPayerEmail},
  {label: 'Request Payer Name, Phone & Email', handlePress: requestPayerAll},
];

const SHIPPING_ADDRESS_EXAMPLES = [
  {label: 'Static Shipping', handlePress: staticShipping},
  {label: 'Dynamic Shipping', handlePress: dynamicShipping},
  {label: 'No International Shipping', handlePress: noInternationalShipping},
];

const ERROR_EXAMPLES = [
  {label: 'No Total', handlePress: errorNoTotal},
  {label: 'Negative Total', handlePress: errorNegativeTotal},
  {label: 'Invalid Total Amount', handlePress: errorInvalidTotalAmount},
  {label: 'Invalid Display Item Amount', handlePress: errorInvalidDisplayItemAmount},
  {label: 'No Shipping Options', handlePress: errorNoShippingOptions},
  {label: 'Invalid Shipping Options Amount', handlePress: errorInvalidShippingOptionsAmount},
  {label: 'Duplicate Shipping Option Id', handlePress: errorDuplicateShippingOptionsId},
  {label: 'Gateway Not Supported (React Native Only)', handlePress: errorGatewayNotSupported},
];

function ExampleList({examples}) {
  return (
    <View>
      {examples.map(({label, handlePress}) => (
        <TouchableHighlight
          key={label}
          style={styles.exampleLink}
          onPress={handlePress}
          underlayColor="#f0f4f7">
          <Text style={[styles.exampleLinkLabel, !handlePress && {color: '#888'}]}>{label}</Text>
        </TouchableHighlight>
      ))}
    </View>
  );
}

const version = require('react-native-payments/package.json').version;

export default function UpstreamDemo() {
  return (
    <ScrollView style={styles.container}>
      <Header supHeadingText={version} />
      <Text style={styles.subHeading}>Order Summary Examples</Text>
      <ExampleList examples={ORDER_SUMMARY_EXAMPLES} />
      <Text style={styles.subHeading}>Contact Info Examples</Text>
      <ExampleList examples={CONTACT_INFO_EXAMPLES} />
      <Text style={styles.subHeading}>Shipping Address Examples</Text>
      <ExampleList examples={SHIPPING_ADDRESS_EXAMPLES} />
      {__DEV__ ? (
        <View>
          <Text style={styles.subHeading}>Error Examples</Text>
          <ExampleList examples={ERROR_EXAMPLES} />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {marginTop: 8, padding: 10},
  subHeading: {
    ...baseTextStyles,
    marginTop: 20,
    paddingVertical: 10,
    fontSize: 20,
  },
  exampleLink: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#D0D0D2',
  },
  exampleLinkLabel: {fontSize: 16, color: '#0070C9'},
});
