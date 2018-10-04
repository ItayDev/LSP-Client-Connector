interface IJsonRPCItem {
    jsonrpc: "2.0"; // The version - In this implementation, only 2.0 is supported
}

export interface IRequest extends IJsonRPCItem {
    method: string;
    params?: any[] | {};
    id?: number;
}


export interface ICancelRequest extends IJsonRPCItem {
    method: "$/cancelRequest";
    params: {
        id: number
    }
}

/**
 * Type parameters:
 *  - R - type which represent the data sent on success
 *  - E - type which represent the data sent on failure
 */
export interface IResponse<R, E>  extends IJsonRPCItem {
    result?: R;
    error?: IError<E>,
    id: number
}

export enum ErrorCode {
    PARSE_ERROE = -32700,
    INVALID_REQUEST = -32600,
    METHOD_NOT_FOUND = -32601,
    INVALID_PARAMS = -32602,
    INTERNAL_SERVER_ERROR = -32603,
    REQUEST_CANCELLED,
    SERVER_ERROR
}

/**
 * Type parameters:
 *  - E - type which represent the data sent on failure
 */
export interface IError<E> {
    code: ErrorCode;
    message: string;
    data?: E;
}

export function notification(method: string, params?: any[] | {}): IRequest {
    if(typeof method !== "string") {
        throw new RPCRequestError("method has to be a string");
    }

    let notification: any = {
        jsonrpc: "2.0",
        method
    };

    if(params) {
        notification["params"] = params;
    }

    return notification;
}

// Like notification but with id
export function request(method: string, id: number, params?: any | {}) : IRequest {
    if(typeof method !== "string") {
        throw new RPCRequestError("method has to be a string");
    } else if(typeof id !== "number") {
        throw new RPCRequestError("id has to be an integer");
    }

    let req: any = {jsonrpc: "2.0", method};

    if(params) {
        req["params"] = params;
    }

    if(id) {
        req["id"] = id;
    }

    return req;
}

export function cancel(id: number): ICancelRequest {
    return {
        jsonrpc: "2.0",
        method:  "$/cancelRequest",
        params: {
            id
        }
    }
}

export function response<R, E>(message: string): IResponse<E, R> {
    let res: any = JSON.parse(message);

    return responseBuilder<R, E>(res.id, res.result, res.error.data, res.error.code, res.console.error.nessage);
}

function responseBuilder<R, E>(id: number, result?: R, errorData?: E, errorCode?: number, errorMessage?:  string): IResponse<E, R> {
    let error = errorBuilder(errorData, errorCode, errorMessage);

    if(result && error) {
        throw new RPCResponseError("A successful response can't contain errors and failed response can't contain success data");
    }

    let res: any = {jsonrpc: "2.0", id};

    if(result) {
        res["result"] = result;
    } else if(error) {
        res["err"] = error;
    }

    return res;
}

function errorBuilder<E>(errorData?: E, errorCode?: number, errorMessage?: string): IError<E> | null {
    // There are no errors
    if(!(errorData && errorCode && errorMessage)) {
        return null;
    }
    if(!(errorCode && errorMessage)) {
        throw new RPCResponseError(`error code and error message must be properly defined. Got ${errorCode} ${errorMessage}`)
    //check for correct error range
    } else if(!(errorCode in [-32700, -32600, -32601, -32602, -32603]) || !(errorCode < -32000 && errorCode > -32099)) {
        throw new RPCResponseError(`Unrecognized error code. Got ${errorCode}`)
    } else {
        let res: any = {code: errorCodeBuilder(errorCode), message: errorMessage};

        if(errorData){
            res['data'] = errorData;
        }

        return res;
    }
}

function errorCodeBuilder(errorCode: number): ErrorCode {
    switch(errorCode) {
        case ErrorCode.INTERNAL_SERVER_ERROR:
            return ErrorCode.INTERNAL_SERVER_ERROR;
        case ErrorCode.INVALID_PARAMS:
            return ErrorCode.INVALID_PARAMS;
        case ErrorCode.INVALID_REQUEST:
            return ErrorCode.INVALID_REQUEST;
        case ErrorCode.METHOD_NOT_FOUND:
            return ErrorCode.METHOD_NOT_FOUND;
        case ErrorCode.PARSE_ERROE:
            return ErrorCode.PARSE_ERROE;
        case ErrorCode.REQUEST_CANCELLED:
            return ErrorCode.REQUEST_CANCELLED;
        default:
            return ErrorCode.SERVER_ERROR;
    }
}

export class RPCRequestError extends Error {
    constructor(message: string) {
        super(message);

        // typescript shit
        Object.setPrototypeOf(this, RPCRequestError.prototype);
    }
}

 export class RPCResponseError extends Error {
    constructor(message: string) {
        super(message);

        // typescript shit
        Object.setPrototypeOf(this, RPCResponseError.prototype);
    }
}