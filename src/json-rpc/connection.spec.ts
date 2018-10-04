import { IConnection, RPCConnection } from './connection';
import * as chaiAsPromised from "chai-as-promised";
import { RPCRequestError } from './specs';
import {expect, use} from "chai";
import "mocha";

use(chaiAsPromised);

class TestConnection implements IConnection {
    setupResponse: string;

    constructor(customRes?: any) {
        this.setupResponse = '{"jsonrpc":"2.0","result":-19,"id": 2}'
         if(customRes) {
             this.setupResponse = JSON.parse(customRes);
         }
    }

    send(req: string, callback: (res: string) => void) {
        setTimeout(() => {
            callback(this.setupResponse);
        }, 25);
    }
}

describe("Test RPCConnection", () => {
    it("Should send request correctly", async () => {
        const connection = new RPCConnection(new TestConnection());
        const res = await connection.sendRPC([{jsonrpc: "2.0", id: 2, method: "test"}]);

        expect(res).to.deep.equal(JSON.parse('[{"jsonrpc":"2.0","result":-19,"id":2}]'));
    });

    it("Should throw error upon using reserved method name", async () => {
        const connection = new RPCConnection(new TestConnection());
        const invalidMethodName = "rpc.test";
        expect(connection.sendRPC([{jsonrpc: "2.0", id: 2, method: invalidMethodName}]))
        .to.be.rejectedWith(RPCRequestError, `Method names starting with "rpc." are reserved for internal use. Got ${invalidMethodName}`);
    })
})