import React, {useEffect, useState} from 'react';
import {BackHandler, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import HarmonyDemo from './HarmonyDemo';
import UpstreamDemo from './UpstreamDemo';

export default function App() {
  const [screen, setScreen] = useState('home');

  useEffect(() => {
    if (screen === 'home') {
      return undefined;
    }
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setScreen('home');
      return true;
    });
    return () => sub.remove();
  }, [screen]);

  if (screen === 'harmony') {
    return (
      <View style={styles.screen}>
        <TopBar title="HarmonyOS Pay" onBack={() => setScreen('home')} />
        <HarmonyDemo />
      </View>
    );
  }

  if (screen === 'upstream') {
    return (
      <View style={styles.screen}>
        <TopBar title="Upstream Examples" onBack={() => setScreen('home')} />
        <UpstreamDemo />
      </View>
    );
  }

  return (
    <View style={styles.home}>
      <Text style={styles.title}>react-native-payments</Text>
      <Text style={styles.subtitle}>Choose an example to open</Text>
      <TouchableOpacity style={styles.card} onPress={() => setScreen('harmony')}>
        <Text style={styles.cardTitle}>HarmonyOS Pay</Text>
        <Text style={styles.cardBody}>
          Paste a sandbox orderStr, check payment capability, and open checkout
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.card} onPress={() => setScreen('upstream')}>
        <Text style={styles.cardTitle}>Upstream Examples</Text>
        <Text style={styles.cardBody}>
          Original library demos for products, payer, and shipping
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function TopBar({title, onBack}) {
  return (
    <View style={styles.bar}>
      <TouchableOpacity onPress={onBack} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
        <Text style={styles.back}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.barTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#fff'},
  home: {flex: 1, backgroundColor: '#f2f2f7', paddingTop: 72, paddingHorizontal: 20},
  title: {fontSize: 28, fontWeight: '700', color: '#1c1c1e'},
  subtitle: {marginTop: 6, marginBottom: 24, fontSize: 15, color: '#8e8e93'},
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  cardTitle: {fontSize: 18, fontWeight: '600', color: '#1c1c1e'},
  cardBody: {marginTop: 6, fontSize: 14, lineHeight: 20, color: '#636366'},
  bar: {
    paddingTop: 48,
    paddingBottom: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#d1d1d6',
  },
  back: {fontSize: 16, color: '#007aff', width: 56},
  barTitle: {flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '600', color: '#1c1c1e', marginRight: 56},
});
