/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TransactionData } from '../types';
import { parseScriptSig, pubKeyToP2PKHAddress } from '../utils/crypto';

export const RAW_TRANSACTIONS: any[] = [
  {
    txid: '8757d905c90fa2a661bd0e918c0a9124dea1f69770f64a5c918299a2a27b6a56',
    outputsCount: 1,
    inputs: [
      {
        index: 0,
        amountBtc: 350.0,
        address: '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN',
        prevType: 'P2PKH',
        scriptSigHex: '4830450220543d62d5f0b1f1748161452c1ca82eac3799dc94ac4fe3709c489e145844b61302210083739221595c3ebcc3157caa30bacde46ec6e7936652e2948be4ad1e3ce33389014104450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58',
        scriptSigAsm: 'OP_PUSHBYTES_72 30450220543d62d5f0b1f1748161452c1ca82eac3799dc94ac... OP_PUSHBYTES_65 04450120...'
      },
      {
        index: 1,
        amountBtc: 50.0,
        address: '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN',
        prevType: 'P2PKH',
        scriptSigHex: '493046022100ca796e6afd84eda7beabaceb33e4dbda4d2da1c3df73ee23881463b5238993ad0221008bd0d99b2a70cc79a6eed271bb2fc2d91e988d627f94092bad503d67bbdd1e2d014104450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58',
        scriptSigAsm: 'OP_PUSHBYTES_73 30460221... OP_PUSHBYTES_65 04450120...'
      },
      {
        index: 2,
        amountBtc: 50.0,
        address: '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN',
        prevType: 'P2PKH',
        scriptSigHex: '493046022100d03e24aad927f975e6520b0236b874b893d3f824923ea35e022b9cfacfe98ea302210092903f9a3e80b2e4be0e342499e57a7531b4cd6a3f12a1a61ff7cc37d1cfb4e8014104450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58',
        scriptSigAsm: 'OP_PUSHBYTES_73 30460221... OP_PUSHBYTES_65 04450120...'
      },
      {
        index: 3,
        amountBtc: 50.0,
        address: 'P2PK (Uncompressed)',
        prevType: 'P2PK',
        scriptSigHex: '4730440220656ea4f1d84b508ef13b98d049551521fbfb6fa22ea4206e244090e1e462e32d022001813c51692ab10cef6f52d7b271fbf240c090afae5d1ffffa4a481b54b608aa01',
        scriptSigAsm: 'OP_PUSHBYTES_71 30440220... OP_CHECKSIG'
      },
      {
        index: 4,
        amountBtc: 100.0,
        address: '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN',
        prevType: 'P2PKH',
        scriptSigHex: '4730440220623163e933c1b97bba7bee6cb27a966c1ce5ec83aa2a1ab86b821a97f589550f022066282e4a4d9f4321765af41be22220e20c87f490ec0601f51a1bd5186fb53f45014104450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58',
        scriptSigAsm: 'OP_PUSHBYTES_71 30440220...'
      },
      {
        index: 5,
        amountBtc: 50.0,
        address: '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN',
        prevType: 'P2PKH',
        scriptSigHex: '47304402202fbeb158790028ba4486ba013927e30e3be03af4fdc7cbda49332eed43b164f10220748e95d4cc4b8061c8cef173a19223aca576c270bc16c235cea8cd9464f047b1014104450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58',
        scriptSigAsm: 'OP_PUSHBYTES_71 30440220...'
      },
      {
        index: 6,
        amountBtc: 50.0,
        address: '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN',
        prevType: 'P2PKH',
        scriptSigHex: '493046022100ad3f31c22825b24841e70d5b64b01f652712d903fe6ec22d9f9955a70170003e022100b5a2ceeafe316fa7744456aea2c46d9359758c9f424de5d4a345e57cb0fa07f9014104450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58',
        scriptSigAsm: 'OP_PUSHBYTES_73 30460221...'
      },
      {
        index: 7,
        amountBtc: 50.0,
        address: '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN',
        prevType: 'P2PKH',
        scriptSigHex: '48304502200742cb9f5c5dcf17eedbda6d25811ad9647aec97c1390f792c1e01c2caf52bc8022100b735fe985280c3ab34a081b5df53f1b941c4e0dd718a40dd75ebac2f5cf48d0d014104450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58',
        scriptSigAsm: 'OP_PUSHBYTES_72 30450220...'
      }
    ]
  },
  {
    txid: '08e3c207f52e78b5ed633a5a9505898f946f7064dc92d9e83850f2eab6a5d2c1',
    outputsCount: 1,
    inputs: [
      {
        index: 0,
        amountBtc: 50.0,
        address: '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN',
        prevType: 'P2PKH',
        scriptSigHex: '493046022100d77430df3d4ac53a20eda2e490d59da306d151aa216d23b1fffda284b702c8fc022100c195db907e0c1d2501ec015216c80f8bc7d7db16ba7a8fcdb14394a7eeea57ad014104450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58',
        scriptSigAsm: 'OP_PUSHBYTES_73 30460221...'
      },
      {
        index: 1,
        amountBtc: 50.0,
        address: '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN',
        prevType: 'P2PKH',
        scriptSigHex: '48304502205f8c22010e90d148f08f0d5e41c12c9f50bf0c9b6d43c22e6c55ce20b3381553022100dc6e39e8348238c7e79416a5ca3b36396e9a2f0fb5c2c508092558b4ec9f4b8f014104450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58',
        scriptSigAsm: 'OP_PUSHBYTES_72 30450220...'
      },
      {
        index: 2,
        amountBtc: 50.0,
        address: '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN',
        prevType: 'P2PKH',
        scriptSigHex: '483045022100c9d0d9270dc48452111441623df11227d6c3c346700ff1c843127679d9d70db902202e48d2a714c14a04680cc26d46310f81469819c3ba57e704b65c82fa32973651014104450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58',
        scriptSigAsm: 'OP_PUSHBYTES_72 30450221...'
      }
    ]
  },
  {
    txid: '68fe868393f4f7ea01ba5f182554fb9c5bd81a96271465968f5f8e48edd94e92',
    outputsCount: 1,
    inputs: [
      {
        index: 0,
        amountBtc: 100.0,
        address: '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN',
        prevType: 'P2PKH',
        scriptSigHex: '493046022100c502e02ab1ae5f12ff943040faa3a8b36fa5e813bc5e5ac9cba51d08ca2b249d022100f51d2c7876a3a8736e8c3519b8b2bc9d1d6e4b10a7332dda74ca7a29bb12f85f014104450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58',
        scriptSigAsm: 'OP_PUSHBYTES_73 30460221...'
      },
      {
        index: 1,
        amountBtc: 50.0,
        address: 'P2PK (Uncompressed)',
        prevType: 'P2PK',
        scriptSigHex: '48304502204fe9830722621eddf715294c53b2ed7ebe62ed71a44a7834fb4072569deff01c022100b8540b6c6eeb08e6e12e7bc71b7d216aa953925f60c32684c9df0cae201409d701',
        scriptSigAsm: 'OP_PUSHBYTES_72 30450220...'
      },
      {
        index: 2,
        amountBtc: 50.0,
        address: 'P2PK (Uncompressed)',
        prevType: 'P2PK',
        scriptSigHex: '48304502210094a71d3cd939978e26bd6d5ee772c07039b92c2065412e34ee712845dbe0509c022016c57eb5aec3e3c3666dbdaf908db39d4c0dd54ddd2fcd81b05e16e58236194d01',
        scriptSigAsm: 'OP_PUSHBYTES_72 30450221...'
      },
      {
        index: 3,
        amountBtc: 50.0,
        address: 'P2PK (Uncompressed)',
        prevType: 'P2PK',
        scriptSigHex: '4730440220568b9777f1c7a96ecf9132c77d25101f088790a304a17e5e33a269cf23f5d1e4022048760e2e8581e953221e768cd16e636ea5f4ba7090cc8186a1f2350b8720bc4c01',
        scriptSigAsm: 'OP_PUSHBYTES_71 30440220...'
      },
      {
        index: 4,
        amountBtc: 50.0,
        address: '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN',
        prevType: 'P2PKH',
        scriptSigHex: '473044022002a4757f6149888c9778c538a63be745398d85cdcd94f2e6367724dd8cc71ed202205065977ea3645c0ac345367223f28b282cfb48bede7a0d80ed4d8a696168a983014104450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58',
        scriptSigAsm: 'OP_PUSHBYTES_71 30440220...'
      }
    ]
  },
  {
    txid: 'b503ca67d24cf48c15371f12953452680c38426b422f31e7e51fae1d73c6bde9',
    outputsCount: 1,
    inputs: [
      {
        index: 0,
        amountBtc: 50.0,
        address: 'P2PK (Uncompressed)',
        prevType: 'P2PK',
        scriptSigHex: '48304502202be58d960c02f9bb60cff0979e809b3172923f1668ee8dbd7ba26c1e42d20c58022100cc7d9d8e1abab796445fd82d36723505c2cc805020c9c4a5de27b8f9bf6734a401',
        scriptSigAsm: 'OP_PUSHBYTES_72 30450220...'
      },
      {
        index: 1,
        amountBtc: 100.0,
        address: 'P2PK (Uncompressed)',
        prevType: 'P2PK',
        scriptSigHex: '47304402206a866aa308371e4c1d7d2b262ccc156be8c36c0f8403a78823bebaa77fe8472f02202b9c0ac8fea0049fce274786860d21e84e5473bea5beaaba8f76e470916eb53701',
        scriptSigAsm: 'OP_PUSHBYTES_71 30440220...'
      },
      {
        index: 2,
        amountBtc: 50.0,
        address: 'P2PK (Uncompressed)',
        prevType: 'P2PK',
        scriptSigHex: '493046022100d32efa22d312703be0159e6a1102b27871ef05ee3af3f0168f5b9e1b393ad3b1022100ad69379d76550af26a304a31764deb79bb2dec21cfd01fa0be64ac5c9fe4e99701',
        scriptSigAsm: 'OP_PUSHBYTES_73 30460221...'
      },
      {
        index: 3,
        amountBtc: 50.0,
        address: 'P2PK (Uncompressed)',
        prevType: 'P2PK',
        scriptSigHex: '47304402200e74ba3ddcf04ce522ac5cf5e1a3bc4638225e6b6417c8c057166c73a359bf1c022032dfe9ed2ca6f5dcfd936deb915ee5abf343c5fa94416b46569563f0d26fe56301',
        scriptSigAsm: 'OP_PUSHBYTES_71 30440220...'
      },
      {
        index: 4,
        amountBtc: 50.0,
        address: 'P2PK (Uncompressed)',
        prevType: 'P2PK',
        scriptSigHex: '4730440220555c71e58405a7cb51f45e37a203d53bf8176ca41c0bbf21302b394d9a48b50b02201b77c0fa0ad526c3828594a5df10f079612ffe2b580d97b7dbde34433be8a3de01',
        scriptSigAsm: 'OP_PUSHBYTES_71 30440220...'
      },
      {
        index: 5,
        amountBtc: 300.0,
        address: '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN',
        prevType: 'P2PKH',
        scriptSigHex: '483045022067e335343e1959820a2a444ad134300a54acf5abc0d8754f697c525b83700a3b022100cbf6fa80edf4018061f47c83b5217c122dcdd03573b11a7f9ca1cb6bb1be9c66014104450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58',
        scriptSigAsm: 'OP_PUSHBYTES_72 30450220...'
      },
      {
        index: 6,
        amountBtc: 200.0,
        address: 'P2PK (Uncompressed)',
        prevType: 'P2PK',
        scriptSigHex: '473044022070c404294806b245d313207fe77c09ddefba712496610c30abdce0eec07db6c60220055bd3e7397b355aa9fade25d1925fb0d8806e2bad737b7c26956e85d1afea5001',
        scriptSigAsm: 'OP_PUSHBYTES_71 30440220...'
      },
      {
        index: 7,
        amountBtc: 50.0,
        address: 'P2PK (Uncompressed)',
        prevType: 'P2PK',
        scriptSigHex: '473044022066588c8e668c51ec3eecf402f39534c303ed77be87c0e76a55485112a13d9e0602203341daab46e9b2875a22a6d1744c71c8eee394dfa80e02116a06844eba63422501',
        scriptSigAsm: 'OP_PUSHBYTES_71 30440220...'
      }
    ]
  },
  {
    txid: 'c7b846b1cc0214bbd4ea6c88f58023c309d97f7367fb300fa51e99436af902bc',
    outputsCount: 1,
    inputs: [
      {
        index: 0,
        amountBtc: 100.0,
        address: 'P2PK (Uncompressed)',
        prevType: 'P2PK',
        scriptSigHex: '49483045022100b89429332d5abe169f58a4b9ca1741f8305611f314a214157ea7acc7cb61dd6c0220602a3572b996944e11bb99a038cf8f3858f2a43518b46dd0be757e8271d999a001',
        scriptSigAsm: 'OP_PUSHBYTES_72 30450221...'
      },
      {
        index: 1,
        amountBtc: 50.0,
        address: 'P2PK (Uncompressed)',
        prevType: 'P2PK',
        scriptSigHex: '4948304502210083b1e9837ba89b51904109aff3b43160205d6f5bf864aaabacca3a57141204ee022028253eef8c58d3e7f66015aeb1da061f7563ae757bb59bb8954551722301f85301',
        scriptSigAsm: 'OP_PUSHBYTES_72 30450221...'
      },
      {
        index: 2,
        amountBtc: 300.0,
        address: '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN',
        prevType: 'P2PKH',
        scriptSigHex: '4830450221009a607b6f144f121eaca101aa53e15a8f2475aec4b9c6c1ac1561685a1af4d8b102201fb2a58efc75355cc8f835cca5c0b33c596c4891c4d169b4ad526f7b411e612b014104450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58',
        scriptSigAsm: 'OP_PUSHBYTES_72 30450221...'
      },
      {
        index: 3,
        amountBtc: 50.0,
        address: 'P2PK (Uncompressed)',
        prevType: 'P2PK',
        scriptSigHex: '4a493046022100a1b329ae3d10e575345e37ba302876a5d9878d57af3f3a807f375dc1aa8a2cdb022100937d152d76aa7d7be718ea585ea214ab6d8b8f901dba570ff6602f1f37d4b16e01',
        scriptSigAsm: 'OP_PUSHBYTES_73 30460221...'
      }
    ]
  },
  {
    txid: 'beb7ec775e1eb8b46b19f18a879f422aa2fa1f1fe7d18ded2e419faf8c67c65b',
    outputsCount: 1,
    inputs: [
      {
        index: 0,
        amountBtc: 150.0,
        address: '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN',
        prevType: 'P2PKH',
        scriptSigHex: '49304602210094a600c91cbc179fa74a8cefff27d0cc097421fc7230e4696c438b50fc5dfd70022100e3fcbe7de5513b39f3436aec6a7f25f3a8ccb3c6147692a8921960f27ba927ad014104450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58',
        scriptSigAsm: 'OP_PUSHBYTES_73 30460221...'
      },
      {
        index: 1,
        amountBtc: 50.0,
        address: 'P2PK (Uncompressed)',
        prevType: 'P2PK',
        scriptSigHex: '48304502205ed79370b638d6f2ba8ea523c94db6b490fd6d2f19df8938b9209480a45e7eef022100efdddfaf69384cf40c2681fe1b03f67c07b30ff3e94a413281f43792d6ec6bdd01',
        scriptSigAsm: 'OP_PUSHBYTES_72 30450220...'
      },
      {
        index: 2,
        amountBtc: 50.0,
        address: 'P2PK (Uncompressed)',
        prevType: 'P2PK',
        scriptSigHex: '4830450221008f9b3d05eb3f472a675d90982b305c2465288e8527075c788a81c23c78815abb022013efb337ceb1d77c76144121adc21c277568aba8118f1958f02b47666fcdb80501',
        scriptSigAsm: 'OP_PUSHBYTES_72 30450221...'
      },
      {
        index: 3,
        amountBtc: 100.0,
        address: 'P2PK (Uncompressed)',
        prevType: 'P2PK',
        scriptSigHex: '493046022100a89366ec079e063147e44eb24c7c1dba8c24d0e408c84774c081663861001470022100a13dfc22c69fbaac4cd60f722f1dc76c4bbe3c767f2ccb90ac7f53e43713d40301',
        scriptSigAsm: 'OP_PUSHBYTES_73 30460221...'
      },
      {
        index: 4,
        amountBtc: 200.0,
        address: '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN',
        prevType: 'P2PKH',
        scriptSigHex: '493046022100902e3f18a997b9eb0d7db5d69cad644e7d1dccba1f9155e5ed246f9efb455fc4022100acf92592172d0827b13220dd00c6615e0bc2f8cbb25fcbb19de8db6cb97b1507014104450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58',
        scriptSigAsm: 'OP_PUSHBYTES_73 30460221...'
      }
    ]
  },
  {
    txid: '33cab39fe58736e8f9e6786002f44601115cbe6a820ac1574a7cdf5505d83903',
    outputsCount: 1,
    inputs: [
      {
        index: 0,
        amountBtc: 100.0,
        address: '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN',
        prevType: 'P2PKH',
        scriptSigHex: '473044022050af9acadefcb8b72dfa428395e226a1fa5f2f9cf88df4753017ac4ae99fc055022049619d63e9817107ae6d2b3c4dbc1f77ad04a05453767cae6cc0c362109052b1014104450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58',
        scriptSigAsm: 'OP_PUSHBYTES_71 30440220...'
      },
      {
        index: 1,
        amountBtc: 50.0,
        address: 'P2PK (Uncompressed)',
        prevType: 'P2PK',
        scriptSigHex: '483045022031d354638d69fc9ceea628cfce051de6d09992f5e9ab246c1747dbeecf6f9fd8022100aee76412a4591623de3bf71954bb67f130aa6b7d199b4ae02ab84b81327eb80a01',
        scriptSigAsm: 'OP_PUSHBYTES_72 30450220...'
      },
      {
        index: 2,
        amountBtc: 50.0,
        address: '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN',
        prevType: 'P2PKH',
        scriptSigHex: '48304502205528afd6d32c91db14f54a763bfa898cb27175fddc920a9fd5d96944e89dcc390221008ae056655af4c6721b7317b1d8bd78d8ed79b0955f54d14a810f3470b878a604014104450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58',
        scriptSigAsm: 'OP_PUSHBYTES_72 30450220...'
      },
      {
        index: 3,
        amountBtc: 50.0,
        address: '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN',
        prevType: 'P2PKH',
        scriptSigHex: '48304502207d213411965d59ab95371db65b82573defb961e68ed5b68b8d9ce4820e784e9c022100b89a6602afca0ffbf1d2b3ac4b1d20f9490ba988af0dc00c9eea0c6207021057014104450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58',
        scriptSigAsm: 'OP_PUSHBYTES_72 30450220...'
      },
      {
        index: 4,
        amountBtc: 50.0,
        address: 'P2PK (Uncompressed)',
        prevType: 'P2PK',
        scriptSigHex: '483045022100f6eb3485aa7c395dd9d378b9dc2c2bd96be9cb41d38d86fd351cef5d70c3ca2d02207e4f712c5e0b888ef10ade4c0de8ddb7e0d5dfcd67cda2490c4eb47219cb317301',
        scriptSigAsm: 'OP_PUSHBYTES_72 30450221...'
      },
      {
        index: 5,
        amountBtc: 50.0,
        address: 'P2PK (Uncompressed)',
        prevType: 'P2PK',
        scriptSigHex: '493046022100c735de32c40ed0b5532e35c295c924f4aeb0da43ed93c24da43707a68cc77839022100f961fb0121d06a89d963976fbba9abfcb4569e0510be9857ca5b414e96331f7301',
        scriptSigAsm: 'OP_PUSHBYTES_73 30460221...'
      },
      {
        index: 6,
        amountBtc: 50.0,
        address: 'P2PK (Uncompressed)',
        prevType: 'P2PK',
        scriptSigHex: '493046022100fb6fb047b7b006802b13d9efcb78495606543bfdf3295e7f95cf8117a803c562022100b10ae26a0feee30a5289db0e0e6c3418fc78d6e64c7c4c5fa3b67c75cee397d501',
        scriptSigAsm: 'OP_PUSHBYTES_73 30460221...'
      },
      {
        index: 7,
        amountBtc: 50.0,
        address: 'P2PK (Uncompressed)',
        prevType: 'P2PK',
        scriptSigHex: '48304502204342f343183affdb939b55b8a5f514c99adced23cf964be50ce2ba392839440d022100ca6ca0eae6aabfe906f051c5334945fc8bf9a6387a04512d2514700eafe0f70001',
        scriptSigAsm: 'OP_PUSHBYTES_72 30450220...'
      },
      {
        index: 8,
        amountBtc: 50.0,
        address: 'P2PK (Uncompressed)',
        prevType: 'P2PK',
        scriptSigHex: '49304602210099463523fcc83c135f5c8e251e5d6907b6eb76091e4dfd80d4ad26d378094ff2022100e1101f318a60124e148d4ae5f7c240dd160c920f71dc11f08c7cb6f1ee06584201',
        scriptSigAsm: 'OP_PUSHBYTES_73 30460221...'
      },
      {
        index: 9,
        amountBtc: 850.0,
        address: '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN',
        prevType: 'P2PKH',
        scriptSigHex: '48304502207235f4fae362ac7a559d9c01824bfb0abbb20a1113c1644e45fe6cab82cc8a47022100e090ded7164f8ecaa03da4eb0d4e336dfcabf1fa9c16f4d2e887648ca76ec09f014104450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58',
        scriptSigAsm: 'OP_PUSHBYTES_72 30450220...'
      }
    ]
  },
  {
    txid: 'e1e0e8d0cbf24c06e262ef86b181e1a37dd636d63dcb67f16ca2072d1cdc799b',
    outputsCount: 1,
    inputs: [
      {
        index: 0,
        amountBtc: 100.0,
        address: '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN',
        prevType: 'P2PKH',
        scriptSigHex: '483045022067dc08b6669ce07c6255bd1b08c19d5b3c2d6c16bc8cc310c92ec20ace38cb02022100ba61e8d112d313077a52528dbed0574730064cad61bc53a94595b2a62636a3ce014104450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58',
        scriptSigAsm: 'OP_PUSHBYTES_72 30450220...'
      },
      {
        index: 1,
        amountBtc: 100.0,
        address: 'P2PK (Uncompressed)',
        prevType: 'P2PK',
        scriptSigHex: '483045022100fe7d957a80b6f30e14fb566a91b88dc630663f89d5c108b9a91ea6da23875166022052b677e7f84c1e743e54ddfb00cdea6fe944ff21f1edb2c2bb54091a2461198001',
        scriptSigAsm: 'OP_PUSHBYTES_72 30450221...'
      },
      {
        index: 2,
        amountBtc: 100.0,
        address: '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN',
        prevType: 'P2PKH',
        scriptSigHex: '483045022100e22974923e6e9d973ab4ed61424d2b2407d92319e54fc72f8089cb747e43792c022010719dec62539deba4c63c2bdd653090fcb689c6d475d868fef0d91b0e8eb598014104450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58',
        scriptSigAsm: 'OP_PUSHBYTES_72 30450221...'
      },
      {
        index: 3,
        amountBtc: 100.0,
        address: '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN',
        prevType: 'P2PKH',
        scriptSigHex: '4830450220397e09f67eda1ab521b5c9c1e7691a57b588980d34a4bcfbe81752a8f94c4e01022100d827029d7a7faf430fd34f36121db6e1ffa1f47523abbad538abb176778f000c014104450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58',
        scriptSigAsm: 'OP_PUSHBYTES_72 30450220...'
      }
    ]
  },
  {
    txid: '347bbf87966b181ad1a239863c504286241f16461ad8af411dcc1a6cd00a1492',
    outputsCount: 1,
    inputs: [
      {
        index: 0,
        amountBtc: 50.0,
        address: 'P2PK (Uncompressed)',
        prevType: 'P2PK',
        scriptSigHex: '483045022100cf3401288f6f6edefb5025a1957a76d7a84af5f8fa29ef7bcb457565a550dc48022037337b2bcea1e95bb0be884a5b4678a7f5d56cf16f9059c16e63f35d57edb21601',
        scriptSigAsm: 'OP_PUSHBYTES_72 30450221...'
      },
      {
        index: 1,
        amountBtc: 50.0,
        address: '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN',
        prevType: 'P2PKH',
        scriptSigHex: '4930460221008b44bf4df5290e3edee82a9c985132837b2b538d219492d26d4628d2c5966a46022100c30860e2ffb83c7bc739d71372efa57b5dc6b40aa9666f7170b4d8297289860a014104450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58',
        scriptSigAsm: 'OP_PUSHBYTES_73 30460221...'
      },
      {
        index: 2,
        amountBtc: 50.0,
        address: '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN',
        prevType: 'P2PKH',
        scriptSigHex: '473044022061f83b0cc7c3acede881d917272388339d4c7c7cb69bab701ebb133db4b456a102203cacfde4480292e3dc1c0a936efbc88c291f97728344572c5b3afe09b2dc2776014104450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58',
        scriptSigAsm: 'OP_PUSHBYTES_71 30440220...'
      },
      {
        index: 3,
        amountBtc: 50.0,
        address: '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN',
        prevType: 'P2PKH',
        scriptSigHex: '47304402202d5f39a1abedb8dc9f1e9c4c4d987bb79deed524ef4e317f1ee75713a03bbd150220025f82170262959e1c2eeea4c8cbab3fdc18f082fb39c267a2b76e5121d67a84014104450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58',
        scriptSigAsm: 'OP_PUSHBYTES_71 30440220...'
      },
      {
        index: 4,
        amountBtc: 50.0,
        address: 'P2PK (Uncompressed)',
        prevType: 'P2PK',
        scriptSigHex: '483045022100b912e050788be7d71feef0de227227401d68bb1adc402a4908c1b7aa997e237602207bc61244f61d6e5c2c6072731dba9e5c99013e742f85c182a8b556f269b1334f01',
        scriptSigAsm: 'OP_PUSHBYTES_72 30450221...'
      }
    ]
  },
  {
    txid: '85548dfc4f618c003cd0a5e537e15a6f1f1d26070b5bb889f91d2e977fe66333',
    outputsCount: 1,
    inputs: [
      {
        index: 0,
        amountBtc: 100.0,
        address: '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN',
        prevType: 'P2PKH',
        scriptSigHex: '47304402202d9e19b16ab9b75036f7e0190f7532b1834230b4ba3c23f3ffd0799b70e017ea0220013db0f09b86b083097c7c377e442f2f15bb5735cf0aeb5ade66ae8984ae94dc014104450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58',
        scriptSigAsm: 'OP_PUSHBYTES_71 30440220...'
      },
      {
        index: 1,
        amountBtc: 100.0,
        address: 'P2PK (Uncompressed)',
        prevType: 'P2PK',
        scriptSigHex: '47304402203c1898aea2ced3bb805fcf8c44dd4ee28b7f5279d49b7552755f97143036abbe02203117e5febfc0114bd3ac3fcee32a141b9ed278c8c05e9a669be4f7d1858dbe2b01',
        scriptSigAsm: 'OP_PUSHBYTES_71 30440220...'
      },
      {
        index: 2,
        amountBtc: 100.0,
        address: '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN',
        prevType: 'P2PKH',
        scriptSigHex: '4730440220704131ebc250509f9e0f3afda307a6e921f918a127d7f5279dbc31c3d6f9823802203503eea48372c0ef714c7bf54383f0652035423046cbdb5ea86e03d1e885c861014104450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58',
        scriptSigAsm: 'OP_PUSHBYTES_71 30440220...'
      }
    ]
  },
  {
    txid: 'baaf317df7e4799156d6476664f170c9b08a847c3757f5af303f32487d55af7a',
    outputsCount: 1,
    inputs: [
      {
        index: 0,
        amountBtc: 50.0,
        address: 'P2PK (Uncompressed)',
        prevType: 'P2PK',
        scriptSigHex: '473044022007a6fadd94e070332ccbec89eeba596b41ba425e6955f4aef31d2f2366296ca6022071e3c495ff540e9d0bddb3619aac4045b9f8f916c435cb30ea982c70844b5f8401',
        scriptSigAsm: 'OP_PUSHBYTES_71 30440220...'
      },
      {
        index: 1,
        amountBtc: 50.0,
        address: '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN',
        prevType: 'P2PKH',
        scriptSigHex: '47304402207cc1cc3d2ad8bd5592492eb8eacb9e413d824e3d865f45bb33332d3898441d4f02203641744912e728c6da05ed06eaac341d1fe58fbf1944aef25812fdda9fa1bdb1014104450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58',
        scriptSigAsm: 'OP_PUSHBYTES_71 30440220...'
      },
      {
        index: 2,
        amountBtc: 50.0,
        address: '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN',
        prevType: 'P2PKH',
        scriptSigHex: '47304402202c7fab9be5733747cf8321927dddac85f7f448bb9b6fcff155286e3613446c5902204c4c9af8ee2d4a7ebd503ec51264e81cc3cc73b150a78ae123d870305ef53fd6014104450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58',
        scriptSigAsm: 'OP_PUSHBYTES_71 30440220...'
      },
      {
        index: 3,
        amountBtc: 50.0,
        address: '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN',
        prevType: 'P2PKH',
        scriptSigHex: '493046022100fa47ef8da71d21dd7c5baca81bb05c93d004174373c900c464732f6f16d6f047022100a748f87377b68f7a60b0b945871299c0c9b654fafc41d688db81838016b65e61014104450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58',
        scriptSigAsm: 'OP_PUSHBYTES_73 30460221...'
      },
      {
        index: 4,
        amountBtc: 50.0,
        address: '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN',
        prevType: 'P2PKH',
        scriptSigHex: '4730440220761299b03cff332186532708295638b875e965ef1a9fbb0386bdb4b2bd03032c022066dcd701c6efae3a63c70a19788718ded394843bf1b479b9014212fd1083e52f014104450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58',
        scriptSigAsm: 'OP_PUSHBYTES_71 30440220...'
      },
      {
        index: 5,
        amountBtc: 50.0,
        address: '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN',
        prevType: 'P2PKH',
        scriptSigHex: '47304402205f3d2cff458d46686a0626e1ef13d1690884b26e14cc7716d1d6c0a2c788ac3402201b4ec7da78c79631f76fecf9abb217820cdf459df6c159031874a2584ad6a895014104450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58',
        scriptSigAsm: 'OP_PUSHBYTES_71 30440220...'
      }
    ]
  },
  {
    txid: 'fe3b5440cc3a57f983f3b4c8387c56d2c7f6690876a0f522d2a23394e924a95e',
    outputsCount: 1,
    inputs: [
      {
        index: 0,
        amountBtc: 100.0,
        address: '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN',
        prevType: 'P2PKH',
        scriptSigHex: '4730440220518fcfd0e50cb0871d342d5ef0efbc631f6ce9c0ed363515bffb20dcb394e27b022045b7b7390121607ffadb37caa0676e29205c94c7562e94f41419831a2e6621f4014104450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58',
        scriptSigAsm: 'OP_PUSHBYTES_71 30440220...'
      },
      {
        index: 1,
        amountBtc: 150.0,
        address: '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN',
        prevType: 'P2PKH',
        scriptSigHex: '48304502205af09c626bc1ed9e8627108f0a50a0c7a0fbf0cbc7e1929cb1e165545ae9e22f022100f290e66a51d76d6746af76e2ad0f0a7ca550905dbe7762d3e06e828fbb23992f014104450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58',
        scriptSigAsm: 'OP_PUSHBYTES_72 30450220...'
      },
      {
        index: 2,
        amountBtc: 100.0,
        address: '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN',
        prevType: 'P2PKH',
        scriptSigHex: '493046022100caeff20ae8c99f241f6dfdec25b08b1a593c93f930b11b37810cbc5c3450b2590221009964b8e673398d3f6b8bec2e3fadd9fe8d456a188aa01be7a596dcc7d2ee48d014104450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58',
        scriptSigAsm: 'OP_PUSHBYTES_73 30460221...'
      }
    ]
  },
  {
    txid: '6936e5a4ecbb98b332eeb616a362603477e782122b5f5fedf4ab7960fc897cc6',
    outputsCount: 1,
    inputs: [
      {
        index: 0,
        amountBtc: 50.0,
        address: '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN',
        prevType: 'P2PKH',
        scriptSigHex: '47304402204135c543fdcc74348c9a707b8746091939a3eb8d725aa7365f41fdc209bc8b0a022017da3c0f8906a246c943a1e425329ec56fcb9c419bfd162bb8bf98a9c6eec03a014104450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58',
        scriptSigAsm: 'OP_PUSHBYTES_71 30440220...'
      },
      {
        index: 1,
        amountBtc: 150.0,
        address: '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN',
        prevType: 'P2PKH',
        scriptSigHex: '483045022100f57a51744be1c5864233af536d40d8391f6738d1ba87bfda6d7b180a656ed93c02205fd5358e9063d018197306c82f1782eb0507056ee017f74280b61d8746908b5d014104450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58',
        scriptSigAsm: 'OP_PUSHBYTES_72 30450221...'
      },
      {
        index: 2,
        amountBtc: 150.0,
        address: '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN',
        prevType: 'P2PKH',
        scriptSigHex: '48304502207ec1098cce1ed59c7a3b3279dbb43936c9e21bfc4cd7f875683d3889037aaeec022100c84bc75b978b5cdad857847c5835c86e43a5c3f40b2c407b68263527fd3b51dc014104450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58',
        scriptSigAsm: 'OP_PUSHBYTES_72 30450220...'
      },
      {
        index: 3,
        amountBtc: 250.0,
        address: '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN',
        prevType: 'P2PKH',
        scriptSigHex: '4730440220216adab286b075563807978cc4da8f5cdb67f0baf90e2d25089b243ef1f50dc9022021680ba4ca4ecc4c842bf004a15e636f81ce8ff8a1d90e4d6b70a94198677941014104450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58',
        scriptSigAsm: 'OP_PUSHBYTES_71 30440220...'
      }
    ]
  },
  {
    txid: '5ee1c5bbbc155b936e6dadc5b8e9eee759349713eebb5a3490cb223c5117a9de',
    outputsCount: 1,
    inputs: [
      {
        index: 0,
        amountBtc: 150.0,
        address: '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN',
        prevType: 'P2PKH',
        scriptSigHex: '473044022068a0db36c457851a51fa33ba30b515e31e2074d62c327d55ff7ba7dfc73b75e402200f1e6bfd08c598195fff3993ce6f6bb64f832de7ce403575f920f4264af3a71a014104450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58',
        scriptSigAsm: 'OP_PUSHBYTES_71 30440220...'
      }
    ]
  },
  {
    txid: 'c01bf9766e994b8ae999836ea147d1ce9acc431fdb2ad217802242760c89cd69',
    outputsCount: 1,
    inputs: [
      {
        index: 0,
        amountBtc: 50.0,
        address: '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN',
        prevType: 'P2PKH',
        scriptSigHex: '493046022100cdd805c6fad46091f1dbb2580fcd041852b787a066b473bac9b1727940c9afbc022100ab5c819d590748dafa034f6dc5e98465c7504b83e6782275dab776f2d4119688014104450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58',
        scriptSigAsm: 'OP_PUSHBYTES_73 30460221...'
      }
    ]
  }
];

export function getParsedTransactions(pubKey: string = '04450120e2d0bb3670c2da42985c0eb75327883d1017bcb52e94508c6d6a0c54aefcbc920cb386cb289356a9f9c86d01fba0e77b791e29e5b734149da944f20a58'): TransactionData[] {
  const address = pubKeyToP2PKHAddress(pubKey) || '1GiFyGXPd8qUNHe5dtWbt2G3dPs5rxRPeN';
  return RAW_TRANSACTIONS.map(raw => {
    let totalBtcIn = 0;
    const inputs = raw.inputs.map((inp: any) => {
      totalBtcIn += inp.amountBtc;
      const parsedSig = parseScriptSig(inp.scriptSigHex, raw.txid, inp.index);
      
      return {
        ...inp,
        address: inp.address?.startsWith('1') ? address : inp.address,
        pubKey,
        parsedSig
      };
    });

    return {
      txid: raw.txid,
      outputsCount: raw.outputsCount,
      totalBtcIn,
      inputs
    };
  });
}
