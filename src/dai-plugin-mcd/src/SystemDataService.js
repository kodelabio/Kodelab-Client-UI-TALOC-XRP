// import { PublicService } from '@makerdao/services-core';
// import { RAD, RAY, ServiceRoles, SECONDS_PER_YEAR } from './constants';
// import BigNumber from 'bignumber.js';
// import { DAI } from './index';

// export default class SystemDataService extends PublicService {
//   constructor(name = ServiceRoles.SYSTEM_DATA) {
//     super(name, ['smartContract', 'token']);
//   }

//   async getAnnualBaseRate() {
//     const base = await this.jug.base();
//     const baseBigNumber = new BigNumber(base.toString()).dividedBy(RAY).plus(1);
//     return baseBigNumber
//       .pow(SECONDS_PER_YEAR)
//       .minus(1)
//       .toNumber();
//   }

//   async getSystemWideDebtCeiling() {
//     const Line = await this.vat.Line();
//     return new BigNumber(Line.toString()).dividedBy(RAD).toNumber();
//   }

//   adapterAddress(ilk) {
//     const key = 'MCD_JOIN_' + ilk.replace(/-/g, '_');
//     return this.get('smartContract').getContractAddress(key);
//   }

//   async isGlobalSettlementInvoked() {
//     const live = await this.get('smartContract')
//       .getContract('MCD_END')
//       .live();
//     return live.eq(0);
//   }

//   async getSystemSurplus() {
//     const vowAddr = this.get('smartContract').getContractAddress('MCD_VOW');
//     const [dai, sin] = await Promise.all([
//       this.vat.dai(vowAddr),
//       this.vat.sin(vowAddr)
//     ]);
//     return DAI.rad(dai).minus(DAI.rad(sin));
//   }

//   async getTotalDai() {
//     return DAI.rad(await this.vat.debt());
//   }

//   // Helpers ----------------------------------------------

//   get cat() {
//     return this.get('smartContract').getContract('MCD_CAT');
//   }

//   get jug() {
//     return this.get('smartContract').getContract('MCD_JUG');
//   }

//   get vat() {
//     return this.get('smartContract').getContract('MCD_VAT');
//   }

//   get spot() {
//     return this.get('smartContract').getContract('MCD_SPOT');
//   }
// }

export default class SystemDataService{}
