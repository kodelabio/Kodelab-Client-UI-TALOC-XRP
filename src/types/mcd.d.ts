// // declare module '@makerdao/dai-plugin-mcd/schemas'
// // declare module '@makerdao/multicall'
// declare module '@makerdao/dai' {
//   class MakerClass {
//     _container: any
//     _authenticatedPromise: Promise<any>
//     currencies: any
//     QueryApi: any
//     utils: any
//     constructor(preset: any, options?: any, userOptions?: any)
//     authenticate(): Promise<any>
//     addAccount(...args: any[]): any
//     currentAccount(...args: any[]): any
//     listAccounts(...args: any[]): any
//     useAccount(...args: any[]): any
//     useAccountWithAddress(...args: any[]): any
//     currentAddress(...args: any[]): any
//     on(...args: any[]): any
//     getToken(...args: any[]): any
//     currentProxy(...args: any[]): any
//     watch(...args: any[]): any
//     latest(...args: any[]): any
//     openCdp(): void
//     getCdp(): void
//     getCdpIds(): void
//     service(service: any, skipAuthCheck?: boolean): any
//   }
//   declare function create(...args: any[]): Promise<MakerClass>
//   declare const Maker: {
//     create: (...args: any[]) => Promise<MakerClass>
//     currencies: any
//     QueryApi: any
//     utils: any
//   }
// }

// declare module '@makerdao/currency' {
//   function createCurrency(symbol: string): CreatorFn
//   class Currency {}
// }
