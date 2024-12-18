import {StatusCodes} from "http-status-codes";
import {ResponsableError} from "../custom-error";

class FormActionDenied extends ResponsableError {
    StatusCode: number = StatusCodes.UNPROCESSABLE_ENTITY;
    constructor(public message: string) {
        super(message);
        Object.setPrototypeOf(this, FormActionDenied.prototype);
    }
    serialize(): {message: string} {
        return {message: this.message};
    }
}

export default FormActionDenied;
