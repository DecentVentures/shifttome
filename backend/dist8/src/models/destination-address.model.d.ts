import { Entity } from "@loopback/repository";
import { InputAddress } from "./input-address.model";
export declare class DestinationAddress extends Entity {
    currency: string;
    address: string;
    user?: string;
    inputs?: InputAddress[];
    constructor(data?: Partial<DestinationAddress>);
}
