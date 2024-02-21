// class Race {
//
//     private timeoutHandles = [];
//
//     after(msecs: number, handler: () => 'continue' | 'finish' | undefined) {
//         this.timeoutHandles.push(setTimeout(() => {
//             const r = handler();
//             if (r === 'finish') {
//
//             }
//         }, msecs));
//     }
//
// }
//
// export function race() {
//     return new Race();
// }