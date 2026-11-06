import React, {useRef, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {Tester, TestSuite, TestCase} from '@react-native-oh-tpl/testerino';
import {PaymentRequest} from 'react-native-payments';

const ORDER_ID = 'example-order';
const details = () => ({
  id: ORDER_ID,
  total: {label: 'Total', amount: {currency: 'CNY', value: '1.00'}},
});
const METHOD_DATA = [{supportedMethods: ['huawei-pay'], data: {}}];

function errorText(error) {
  return String(error && error.message ? error.message : error).replace(/^Error:\s*/, '');
}

function ReadOnlyValue({label, value, tall}) {
  return (
    <View style={styles.valueBlock}>
      <Text style={styles.valueLabel}>{label}</Text>
      <TextInput
        editable={false}
        multiline={!!tall}
        scrollEnabled={!!tall}
        value={value}
        style={[styles.readOnly, tall && styles.readOnlyTall]}
      />
    </View>
  );
}

function methods(orderStr) {
  return [{supportedMethods: ['huawei-pay'], data: {orderStr}}];
}

function requestFor(orderStr) {
  return orderStr.trim()
    ? new PaymentRequest(methods(orderStr), details())
    : new PaymentRequest(METHOD_DATA, details());
}

let currentOrderStr = '';

function Availability({state, setState}) {
  const [text, setText] = useState('');
  const ticket = useRef(0);
  const created = useRef(null);
  if (!created.current) created.current = new PaymentRequest(METHOD_DATA, details());

  const onChangeText = async next => {
    const current = ++ticket.current;
    setText(next);
    currentOrderStr = next;
    try {
      const value = await requestFor(next).canMakePayments();
      if (current !== ticket.current) return;
      setState({orderStr: next, shown: String(value), id: requestFor(next).id});
    } catch (e) {
      if (current !== ticket.current) return;
      setState({orderStr: next, shown: errorText(e), id: created.current.id});
    }
  };

  return (
    <View>
      <ReadOnlyValue label="PaymentRequest.id" value={state.id || created.current.id} />
      <Text style={styles.valueLabel}>orderStr</Text>
      <TextInput
        value={text}
        onChangeText={onChangeText}
        multiline
        placeholder="orderStr"
        placeholderTextColor="#8e8e93"
        style={styles.input}
      />
      <ReadOnlyValue label="canMakePayments()" value={state.shown || '—'} />
    </View>
  );
}

function ShowResult({state, setState}) {
  const pay = async () => {
    try {
      const parsed = JSON.parse(currentOrderStr);
      const reserved = typeof parsed.reserved === 'string' ? JSON.parse(parsed.reserved) : parsed.reserved;
      if (!reserved || reserved.sandbox_flag !== true) {
        throw new Error('Only sandbox orders with sandbox_flag are accepted');
      }
      const response = await new PaymentRequest(methods(currentOrderStr), details()).show();
      let successComplete = '';
      let againComplete = '';
      let failComplete = '';
      try {
        successComplete = String(await response.complete('success'));
      } catch (e) {
        successComplete = errorText(e);
      }
      try {
        againComplete = String(await response.complete('unknown'));
      } catch (e) {
        againComplete = errorText(e);
      }
      try {
        failComplete = String(await response.complete('fail'));
      } catch (e) {
        failComplete = errorText(e);
      }
      setState({
        ok: true,
        requestId: response.requestId,
        methodName: response.methodName,
        detailsText: JSON.stringify(response.details, null, 2),
        status: response.details.status,
        requiresServerVerification: String(response.details.requiresServerVerification),
        successComplete,
        againComplete,
        failComplete,
        message: '',
      });
    } catch (e) {
      setState(prev => ({...prev, ok: false, message: errorText(e)}));
    }
  };

  return (
    <View>
      <TouchableOpacity style={styles.btnPay} onPress={pay}>
        <Text style={styles.btnText}>show()</Text>
      </TouchableOpacity>
      {!!state.message && <ReadOnlyValue label="error" value={state.message} />}
      <ReadOnlyValue label="PaymentResponse.requestId" value={state.requestId || '—'} />
      <ReadOnlyValue label="PaymentResponse.methodName" value={state.methodName || '—'} />
      <ReadOnlyValue label="PaymentResponse.details" value={state.detailsText || '—'} tall />
      <ReadOnlyValue label="complete('success')" value={state.successComplete || '—'} />
      <ReadOnlyValue label="complete('unknown')" value={state.againComplete || '—'} />
      <ReadOnlyValue label="complete('fail')" value={state.failComplete || '—'} />
    </View>
  );
}

const showInitial = {
  ok: false,
  requestId: '',
  methodName: '',
  detailsText: '',
  status: '',
  requiresServerVerification: '',
  successComplete: '',
  againComplete: '',
  failComplete: '',
  message: '',
};

export default function HarmonyDemo() {
  return (
    <Tester style={styles.tester}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <TestSuite name="PaymentRequest">
          <TestCase
            itShould="canMakePayments()"
            initialState={{orderStr: '', shown: '', id: ''}}
            arrange={({state, setState}) => <Availability state={state} setState={setState} />}
            assert={async ({expect, state}) => {
              const hasOrder = typeof state.orderStr === 'string' && state.orderStr.trim().length > 0;
              const value = await requestFor(state.orderStr || '').canMakePayments();
              expect(value).to.equal(hasOrder);
              expect(state.id || ORDER_ID).to.equal(ORDER_ID);
            }}
          />
        </TestSuite>
        <TestSuite name="PaymentResponse">
          <TestCase
            itShould="show()"
            initialState={showInitial}
            arrange={({state, setState}) => <ShowResult state={state} setState={setState} />}
            assert={({expect, state}) => {
              expect(state.ok, state.message).to.equal(true);
              expect(state.requestId).to.equal(ORDER_ID);
              expect(state.methodName).to.equal('huawei-pay');
              expect(state.status).to.equal('submitted');
              expect(state.requiresServerVerification).to.equal('true');
              expect(state.successComplete).to.equal('undefined');
              expect(state.againComplete).to.include('InvalidStateError');
              expect(state.failComplete).to.include('InvalidStateError');
            }}
          />
        </TestSuite>
      </ScrollView>
    </Tester>
  );
}

const styles = StyleSheet.create({
  tester: {flex: 1},
  scroll: {flex: 1},
  container: {paddingBottom: 40},
  valueBlock: {marginTop: 10},
  valueLabel: {fontSize: 13, color: '#3a3a3c', marginBottom: 4},
  readOnly: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d1d1d6',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f2f2f7',
    color: '#1c1c1e',
    fontSize: 14,
  },
  readOnlyTall: {
    minHeight: 140,
    textAlignVertical: 'top',
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d1d1d6',
    borderRadius: 8,
    padding: 10,
    minHeight: 72,
    textAlignVertical: 'top',
    fontSize: 13,
    color: '#1c1c1e',
    backgroundColor: '#fff',
  },
  btnPay: {borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 8, backgroundColor: '#34C759'},
  btnText: {color: '#fff', fontSize: 16, fontWeight: '600'},
});
