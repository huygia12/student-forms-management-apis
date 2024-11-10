import {StatusCodes} from "http-status-codes";
import {ResponsableError} from "../custom-error";

class DowloadFileError extends ResponsableError {
    StatusCode: number = StatusCodes.SERVICE_UNAVAILABLE;
    constructor(public message: string) {
        super(message);
        Object.setPrototypeOf(this, DowloadFileError.prototype);
    }
    serialize(): {message: string} {
        return {message: this.message};
    }
}

export default DowloadFileError;
