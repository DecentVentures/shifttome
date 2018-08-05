import { DefaultCrudRepository, juggler } from "@loopback/repository";
import { DestinationAddress } from "../models";
export declare class DestinationAddressRepository extends DefaultCrudRepository<DestinationAddress, typeof DestinationAddress.prototype.address> {
    protected datasource: juggler.DataSource;
    constructor(datasource: juggler.DataSource);
}
