import {IRequest, IResponse, ICancelRequest, RPCRequestError, RPCResponseError} from "./specs";
/**
 * This is the channel of communication between the server and the RPCConnection class.
 * 
 * Any object which implemens this interface can be used inside RPCConnection (it 
 * can be a socket, process, websocket etc.)
 */
export interface IConnection {
    /**
     * Params:
     * @param requests: The json conataining the request (or a bactch of requests)
     * @param onResponse: A callback to be called with the result's json when the server has it
     */
    send: (requests: string, onReponse: (results: string) => void) => void;
}

export class RPCConnection {
    constructor(private connection: IConnection){}

    cancelRequest(cancel: ICancelRequest): void {
        this.connection.send(JSON.stringify(cancel), (res) => {
            console.info(`request for cancellation with the id ${cancel.params.id} has been sent for the method ${cancel.method}`)
        });
    }

    async sendRPC<R, E>(requests: IRequest[]): Promise<IResponse<R, E>[]> {
        return new Promise<IResponse<R, E>[]>((rs, rj) => {

            for(let request of requests) {
                if(!this.checkRequestValidity(request, rj)) {
                    return;
                }
            }

            // Making sure not to make the server think it is a batch if one request was specified 
            let jsonRequest = requests.length === 1? JSON.stringify(requests[0]) : JSON.stringify(requests)
            
            this.connection.send(jsonRequest, (res) => {
                const result: IResponse<R, E> | IResponse<R, E>[] = JSON.parse(res);
                let results: IResponse<R, E>[];

                if(result instanceof Array) {
                    results = result;
                } else {
                    results = [result]; 
                }
                
                // Check for server correctness
                if(requests.filter((request) =>  request.id !== undefined).length !== results.length) {
                    rj(new RPCResponseError("The number of responses has to match the number of requests"));
                    return;
                }
                
                rs(results);
            })
        })
    }

    private checkRequestValidity(request: IRequest, reject: (err: any) => void): boolean {
        if(request.method.startsWith("rpc.")) {
            reject(new RPCRequestError(`Method names starting with "rpc." are reserved for internal use. Got ${request.method}`))
            return false;
        }

        return true;
    }
}