// not run through babel, so we must use an ES5-safe export
import BAT from './abis/BAT.json'
import MCD_CAT from './abis/Cat.json'
import OLD_MCD_CAT from './abis/Cat.json'
import DGD from './abis/DGD.json'
import MCD_DAI_GUARD from './abis/DSGuard.json'
import MCD_PAUSE from './abis/DSPause.json'
import MCD_ADM from './abis/DSRoles.json'
import MCD_DAI from './abis/DSToken.json'
import MCD_GOV from './abis/DSToken.json'
import TUSD from './abis/DSToken.json'
import MANA from './abis/DSToken.json'
import USDT from './abis/DSToken.json'
import PAXUSD from './abis/DSToken.json'
import COMP from './abis/DSToken.json'
import LRC from './abis/DSToken.json'
import LINK from './abis/DSToken.json'
import YFI from './abis/DSToken.json'
import BAL from './abis/DSToken.json'
import UNI from './abis/DSToken.json'
import RENBTC from './abis/DSToken.json'
import AAVE from './abis/DSToken.json'
import UNIV2DAIETH from './abis/DSToken.json'
import UNIV2WBTCETH from './abis/DSToken.json'
import UNIV2USDCETH from './abis/DSToken.json'
import UNIV2DAIUSDC from './abis/DSToken.json'
import UNIV2ETHUSDT from './abis/DSToken.json'
import UNIV2LINKETH from './abis/DSToken.json'
import UNIV2UNIETH from './abis/DSToken.json'
import UNIV2WBTCDAI from './abis/DSToken.json'
import UNIV2AAVEETH from './abis/DSToken.json'
import UNIV2DAIUSDT from './abis/DSToken.json'
import HOT from './abis/DSToken.json'
import HOTT from './abis/DSToken.json'
import SAI from './abis/DSToken.json'
import PIP_XING from './abis/DSValue.json'
import MCD_JOIN_DAI from './abis/DaiJoin.json'
import CDP_MANAGER from './abis/DssCdpManager.json'
import MCD_DEPLOY from './abis/DssDeploy.json'
import PROXY_ACTIONS from './abis/DssProxyActions.json'
import PROXY_ACTIONS_DSR from './abis/DssProxyActionsDsr.json'
import MCD_ESM from './abis/ESM.json'
import MCD_END from './abis/End.json'
import MCD_FLAP from './abis/Flapper.json'
import MCD_FLIP_XING from './abis/Flipper.json'
import MCD_FLOP from './abis/Flopper.json'
import GNT from './abis/GNT.json'
import GUSD from './abis/GUSD.json'
import MCD_JOIN_OMG_A from './abis/GemJoin2.json'
import MCD_JOIN_DGD_A from './abis/GemJoin2.json'
import MCD_JOIN_GNT_A from './abis/GemJoin4.json'
import MCD_JOIN_XING from './abis/GemJoin.json'
import GET_CDPS from './abis/GetCdps.json'
import MCD_JUG from './abis/Jug.json'
import KNC from './abis/KNC.json'
import MIGRATION_PROXY_ACTIONS from './abis/MigrationProxyActions.json'
import MULTICALL from './abis/MultiCall.json'
import OMG from './abis/OMG.json'
import MCD_PAUSE_PROXY from './abis/Plan.json'
import MCD_POT from './abis/Pot.json'
import REP from './abis/REP.json'
import MIGRATION from './abis/ScdMcdMigration.json'
import MCD_SPOT from './abis/Spotter.json'
import USDC from './abis/USDC.json'
import MCD_VAT from './abis/Vat.json'
import MCD_VOW from './abis/Vow.json'
import WBTC from './abis/WBTC.json'
import ETH from './abis/WETH9_.json'
import ZRX from './abis/ZRX.json'

export default {
  BAT,
  DGD,
  KNC,
  OMG,
  REP,
  ZRX,
  GNT,
  SAI,
  CDP_MANAGER,
  ETH,
  GET_CDPS,
  MCD_ADM,
  MCD_CAT,
  OLD_MCD_CAT,
  MCD_DAI,
  MCD_DAI_GUARD,
  MCD_DEPLOY,
  MCD_FLAP,
  'MCD_FLIP_*': MCD_FLIP_XING,
  MCD_FLOP,
  MCD_GOV,
  'MCD_JOIN_*': MCD_JOIN_XING,
  MCD_JOIN_OMG_A,
  MCD_JOIN_DGD_A,
  MCD_JOIN_GNT_A,
  MCD_JOIN_DAI,
  MCD_JUG,
  MCD_END,
  MCD_ESM,
  MCD_PAUSE,
  MCD_PAUSE_PROXY,
  MCD_POT,
  MCD_SPOT,
  MCD_VAT,
  MCD_VOW,
  MULTICALL,
  'PIP_*': PIP_XING,
  PROXY_ACTIONS,
  PROXY_ACTIONS_DSR,
  MIGRATION,
  MIGRATION_PROXY_ACTIONS,
  USDC,
  WBTC,
  TUSD,
  MANA,
  USDT,
  PAXUSD,
  COMP,
  LRC,
  LINK,
  YFI,
  BAL,
  GUSD,
  UNI,
  RENBTC,
  AAVE,
  UNIV2DAIETH,
  UNIV2WBTCETH,
  UNIV2USDCETH,
  UNIV2DAIUSDC,
  UNIV2ETHUSDT,
  UNIV2LINKETH,
  UNIV2UNIETH,
  UNIV2WBTCDAI,
  UNIV2AAVEETH,
  UNIV2DAIUSDT,
  HOT,
  HOTT,
}
// export default {
//   REP: require('./abis/REP.json'),
//   ZRX: require('./abis/ZRX.json'),
//   OMG: require('./abis/OMG.json'),
//   BAT: require('./abis/BAT.json'),
//   DGD: require('./abis/DGD.json'),
//   KNC: require('./abis/KNC.json'),
//   GNT: require('./abis/GNT.json'),
//   SAI: require('./abis/DSToken.json'),
//   CDP_MANAGER: require('./abis/DssCdpManager.json'),
//   ETH: require('./abis/WETH9_.json'),
//   GET_CDPS: require('./abis/GetCdps.json'),
//   MCD_ADM: require('./abis/DSRoles.json'),
//   MCD_CAT: require('./abis/Cat.json'),
//   OLD_MCD_CAT: require('./abis/Cat.json'),
//   MCD_DAI: require('./abis/DSToken.json'),
//   MCD_DAI_GUARD: require('./abis/DSGuard.json'),
//   MCD_DEPLOY: require('./abis/DssDeploy.json'),
//   MCD_FLAP: require('./abis/Flapper.json'),
//   'MCD_FLIP_*': require('./abis/Flipper.json'),
//   MCD_FLOP: require('./abis/Flopper.json'),
//   MCD_GOV: require('./abis/DSToken.json'),
//   'MCD_JOIN_*': require('./abis/GemJoin.json'),
//   MCD_JOIN_OMG_A: require('./abis/GemJoin2.json'),
//   MCD_JOIN_DGD_A: require('./abis/GemJoin2.json'),
//   MCD_JOIN_GNT_A: require('./abis/GemJoin4.json'),
//   MCD_JOIN_DAI: require('./abis/DaiJoin.json'),
//   MCD_JUG: require('./abis/Jug.json'),
//   MCD_END: require('./abis/End.json'),
//   MCD_ESM: require('./abis/ESM.json'),
//   MCD_PAUSE: require('./abis/DSPause.json'),
//   MCD_PAUSE_PROXY: require('./abis/Plan.json'),
//   MCD_POT: require('./abis/Pot.json'),
//   MCD_SPOT: require('./abis/Spotter.json'),
//   MCD_VAT: require('./abis/Vat.json'),
//   MCD_VOW: require('./abis/Vow.json'),
//   MULTICALL: require('./abis/MultiCall.json'),
//   'PIP_*': require('./abis/DSValue.json'),
//   PROXY_ACTIONS: require('./abis/DssProxyActions.json'),
//   PROXY_ACTIONS_DSR: require('./abis/DssProxyActionsDsr.json'),
//   MIGRATION: require('./abis/ScdMcdMigration.json'),
//   MIGRATION_PROXY_ACTIONS: require('./abis/MigrationProxyActions.json'),
//   USDC: require('./abis/USDC.json'),
//   WBTC: require('./abis/WBTC.json'),
//   TUSD: require('./abis/DSToken.json'),
//   MANA: require('./abis/DSToken.json'),
//   USDT: require('./abis/DSToken.json'),
//   PAXUSD: require('./abis/DSToken.json'),
//   COMP: require('./abis/DSToken.json'),
//   LRC: require('./abis/DSToken.json'),
//   LINK: require('./abis/DSToken.json'),
//   YFI: require('./abis/DSToken.json'),
//   BAL: require('./abis/DSToken.json'),
//   GUSD: require('./abis/GUSD.json'),
//   UNI: require('./abis/DSToken.json'),
//   RENBTC: require('./abis/DSToken.json'),
//   AAVE: require('./abis/DSToken.json'),
//   UNIV2DAIETH: require('./abis/DSToken.json'),
//   UNIV2WBTCETH: require('./abis/DSToken.json'),
//   UNIV2USDCETH: require('./abis/DSToken.json'),
//   UNIV2DAIUSDC: require('./abis/DSToken.json'),
//   UNIV2ETHUSDT: require('./abis/DSToken.json'),
//   UNIV2LINKETH: require('./abis/DSToken.json'),
//   UNIV2UNIETH: require('./abis/DSToken.json'),
//   UNIV2WBTCDAI: require('./abis/DSToken.json'),
//   UNIV2AAVEETH: require('./abis/DSToken.json'),
//   UNIV2DAIUSDT: require('./abis/DSToken.json'),
//   HOT: require('./abis/DSToken.json'),
//   HOTT: require('./abis/DSToken.json'),
//   nTKNA: require('./abis/NFToken.json'),
//   nTKNB: require('./abis/NFToken.json'),
//   nTKNC: require('./abis/NFToken.json'),
//   nTKND: require('./abis/NFToken.json'),
//   nTKNE: require('./abis/NFToken.json'),
//   nTOKEN: require('./abis/NFToken.json'),
//   nHT001: require('./abis/DSToken.json'),
//   nHT002: require('./abis/DSToken.json'),
//   nHT0002: require('./abis/DSToken.json'),
//   nHT004: require('./abis/DSToken.json'),
//   nHT005: require('./abis/DSToken.json'),
//   nHT006: require('./abis/DSToken.json'),
//   nHT007: require('./abis/DSToken.json'),
//   // nHZ0001: require('./abis/DSToken.json')
// }
