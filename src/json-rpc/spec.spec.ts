import { expect } from "chai";
import "mocha";

import { request, RPCRequestError } from "./specs";

describe("Specs test suite", () => {
    describe("request", () => {
        it("Should throw exception upon non string method", () => {
            expect(() => {
                request(2 as any, 2)
            }).to.throw(RPCRequestError, "method has to be a string");
        })
        it("Should throw exception upon non integer id", () =>{
            expect(() => {
                request("myMethod", "12.4" as any)
            }).to.throw(RPCRequestError, "id has to be an integer");
        })
        it("Should not contain paramas", () => {
            let req = request("myMethod", 2);
            expect(req).to.deep.equal({jsonrpc: "2.0", method: "myMethod", id: 2});
        })
    })
})