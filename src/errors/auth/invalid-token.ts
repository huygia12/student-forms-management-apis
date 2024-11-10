import {StatusCodes} from "http-status-codes";
import {ResponsableError} from "../custom-error";

class InvalidTokenError extends ResponsableError {
    StatusCode: number = StatusCodes.UNAUTHORIZED;
    constructor(public message: string) {
        super(message);
        Object.setPrototypeOf(this, InvalidTokenError.prototype);
    }
    serialize(): {message: string} {
        return {message: this.message};
    }
}

export default InvalidTokenError;
