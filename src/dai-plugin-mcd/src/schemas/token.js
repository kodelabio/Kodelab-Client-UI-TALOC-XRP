import { getMcdToken } from '../utils';
import BigNumber from 'bignumber.js';
import { createCurrency } from '@makerdao/currency';

import { TOKEN_URI, TOKEN_BALANCE, TOKEN_ALLOWANCE_BASE } from './_constants';
import { validateAddress } from './_validators';

export const ALLOWANCE_AMOUNT = BigNumber(
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
);

export const tokenURI = {
  generate: symbol => {
    return {
      id: `tokenURI.${symbol}`,
      contract: symbol,
      call: ['tokenURI()(string)']
    };
  },
  returns: [TOKEN_URI]
};

export const tokenBalance = {
  generate: (address, symbol) => {
    if (symbol === 'WETH') symbol = 'WETH';
    if (symbol === 'DAI') symbol = 'DAI';

    // const currencyToken = getMcdToken(symbol);
    const currencyToken = createCurrency(symbol);

    const contract =
      symbol === 'DAI' ? 'MCD_DAI' : symbol === 'WETH' ? 'ETH' : symbol;

    if (!currencyToken)
      throw new Error(`${symbol} token is not part of the default tokens list`);
    if (symbol === 'DSR-DAI')
      throw new Error(
        "Balance of DAI in savings cannot be retrieved from a token contract call. To get DAI balance in savings call 'balance('DSR-DAI')'"
      );

    return {
      id: `balance.${symbol}.${address}`,
      contract: symbol === 'ETH' ? 'MULTICALL' : contract,
      call: [
        symbol === 'ETH'
          ? 'getEthBalance(address)(uint256)'
          : 'balanceOf(address)(uint256)',
        address
      ],
      transforms: {
        [TOKEN_BALANCE]: v => {
          if (symbol.substr(0, 1) === 'n') {
            return currencyToken(v, 0);
          }
          if (symbol === 'USDC' || symbol === 'USDT') {
            return currencyToken(v, -6);
          } else if (symbol === 'WBTC' || symbol === 'RENBTC') {
            return currencyToken(v, -8);
          } else if (symbol === 'GUSD') {
            return currencyToken(v, -2);
          } else {
            return currencyToken(v, 'wei');
          }
        }
      }
    };
  },
  returns: [TOKEN_BALANCE]
};

export const tokenBalances = {
  generate: (address, symbols) => ({
    dependencies: symbols.map(symbol => [TOKEN_BALANCE, address, symbol]),
    computed: (...balances) => balances
  })
};

export const tokenAllowanceBase = {
  generate: (address, proxyAddress, symbol) => {
    if (symbol === 'ETH' || symbol === 'DSR-DAI')
      throw new Error(`${symbol} does not require an allowance to be set`);

    // const currencyToken = getMcdToken(symbol);
    const currencyToken = createCurrency(symbol);
    const contract =
      symbol === 'DAI' ? 'MCD_DAI' : symbol === 'WETH' ? 'ETH' : symbol;
    if (!currencyToken)
      throw new Error(`${symbol} token is not part of the default tokens list`);

    return {
      id: `allowance.${symbol}.${address}`,
      contract: contract,
      call: ['allowance(address,address)(uint256)', address, proxyAddress]
    };
  },
  returns: [[TOKEN_ALLOWANCE_BASE, v => BigNumber(v)]]
};

export const tokenAllowance = {
  generate: (address, proxyAddress, symbol) => ({
    dependencies: [
      symbol === 'ETH'
        ? [[ALLOWANCE_AMOUNT]]
        : [TOKEN_ALLOWANCE_BASE, address, proxyAddress, symbol]
    ],
    computed: v => v
  }),
  validate: {
    args: (address, proxyAddress) =>
      validateAddress`Invalid address for tokenAllowance: ${'address'}`(
        address
      ) ||
      validateAddress`Invalid proxy address for tokenAllowance: ${'address'}`(
        proxyAddress
      )
  }
};

export const adapterBalance = {
  generate: collateralTypeName => ({
    dependencies: ({ get }) => {
      let tokenSymbol = collateralTypeName.split('-')[0];
      tokenSymbol = tokenSymbol === 'ETH' ? 'WETH' : tokenSymbol;
      return [
        [
          TOKEN_BALANCE,
          get('smartContract').getContractAddress(
            `MCD_JOIN_${collateralTypeName.replace('-', '_')}`
          ),
          tokenSymbol
        ]
      ];
    },
    computed: v => v
  })
};

export default {
  tokenURI,
  tokenBalance,
  tokenAllowanceBase,

  // computed
  adapterBalance,
  tokenAllowance,
  tokenBalances
};
