import { Entity } from '@loopback/repository';
export declare class InputAddress extends Entity {
    currency: string;
    address: string;
    shift_to: string;
    constructor(data?: Partial<InputAddress>);
}
