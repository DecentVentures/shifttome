import { DefaultCrudRepository, juggler } from "@loopback/repository";
import { DestinationAddress } from "../models";
export declare class InputAddressRepository extends DefaultCrudRepository<DestinationAddress, typeof DestinationAddress.prototype.address> {
    protected datasource: juggler.DataSource;
    constructor(datasource: juggler.DataSource);
}