import {StatusCodes} from "http-status-codes";
import {ResponsableError} from "../custom-error";

class AccessDenided extends ResponsableError {
    StatusCode: number = StatusCodes.FORBIDDEN;
    constructor(public message: string) {
        super(message);
        Object.setPrototypeOf(this, AccessDenided.prototype);
    }
    serialize(): {message: string} {
        return {message: this.message};
    }
}

export default AccessDenided;
