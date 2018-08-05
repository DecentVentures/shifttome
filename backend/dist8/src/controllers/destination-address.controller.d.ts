import { DestinationAddressRepository } from "../repositories";
import { DestinationAddress } from "../models";
import { InputAddressRepository } from "../repositories/input-address.repo";
export declare type ShapeShiftResponse = {
    deposit: string;
    depositType: string;
    withdrawal: string;
    withdrawalType: string;
    public: string;
    xrpDestTag: string;
    apiPubKey: string;
};
export declare class DestinationAddressController {
    protected destAddrRepo: DestinationAddressRepository;
    protected inputAddrRepo: InputAddressRepository;
    constructor(destAddrRepo: DestinationAddressRepository, inputAddrRepo: InputAddressRepository);
    getDestinationAddress(addr: string): Promise<DestinationAddress | null>;
    registerDestinationAddress(destination: DestinationAddress): Promise<void>;
    generateShiftAddress(outputAddress: string, inputCurrency: string, outputCurrency: string): Promise<ShapeShiftResponse>;
    toPair(inputCurrency: string, outputCurrency: string): string;
}
