declare module 'json-rpc' {
    export module specs {
        export const errors: any;
        export function request(method: string, id: number | undefined, params: any, encoded: boolean): string;
        export function response(id: number, result: any, encoded: boolean): string;
        export function error(id: number, code: number, nessage: string, data: any | null, encoded: boolean): string;
    }

    export class rpc {
        constructor(target: string);
        public wrap(route: string, keys?: string[]): any;
        public invoke(route: string, params: any, callback: any, encoded: boolean):any;
    }
}