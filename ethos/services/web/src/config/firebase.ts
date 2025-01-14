import { type FirebaseOptions } from 'firebase/app';
import { getEnvironment } from './environment';

export function getFCMVapidKey(): string {
  const env = getEnvironment();

  switch (env) {
    case 'local':
    case 'dev':
      return 'BNseztvkH0BUoq0WDtQdyrOuCjqTL0Yjef-nXwYxUpikCPns9gUN0dAa_FrPOsjYux7XtD4U2c-D92syDMQ-b2E';
    case 'testnet':
      return 'BE171AnnhpF3Pm3Wp77bEDWNiEht1VJNO2AWVqsKGsWJnkcYsyuIx1XEb56vFLvCFqK9sGyd8zNrzb8y22oPHF8';
    case 'prod':
      return 'BFGRB-QFnmzmVGb5shqvy-gVLufRNimmRRW5PAUgkl6Banjfyg1qNQgSqDnBWIcZ2Vq_EjdQozIeqEir_zO9xKU';
  }
}

export function getFCMConfig(): FirebaseOptions {
  const env = getEnvironment();

  switch (env) {
    case 'local':
    case 'dev':
      return {
        apiKey: 'AIzaSyB8ykTGvBEmCaE0X873mgwgJAjOpxMNcoo',
        authDomain: 'ethos-network-dev.firebaseapp.com',
        projectId: 'ethos-network-dev',
        storageBucket: 'ethos-network-dev.firebasestorage.app',
        messagingSenderId: '1016898622467',
        appId: '1:1016898622467:web:1401e2ced910d6b88fea36',
        measurementId: 'G-8TYFE9KVS3',
      };
    case 'testnet':
      return {
        apiKey: 'AIzaSyD9gSKw_M0nERFYCftbHdLYoUPeiETGoug',
        authDomain: 'ethos-network-testnet.firebaseapp.com',
        projectId: 'ethos-network-testnet',
        storageBucket: 'ethos-network-testnet.firebasestorage.app',
        messagingSenderId: '213255991792',
        appId: '1:213255991792:web:8c4e8228c77f8f62c02d35',
        measurementId: 'G-SJDZB2R33W',
      };
    case 'prod':
      return {
        apiKey: 'AIzaSyDPqF8p-aQWolxda1fgGW1iXZyVLi3VIgc',
        authDomain: 'ethos-network-prod.firebaseapp.com',
        projectId: 'ethos-network-prod',
        storageBucket: 'ethos-network-prod.firebasestorage.app',
        messagingSenderId: '953621901744',
        appId: '1:953621901744:web:2959ca735f493f24022675',
        measurementId: 'G-J6WT25NKJZ',
      };
    default:
      throw new Error('Unknown firebase environment');
  }
}
