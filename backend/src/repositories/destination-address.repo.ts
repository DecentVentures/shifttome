import { DefaultCrudRepository, juggler } from "@loopback/repository";
import { DestinationAddress } from "../models";
import { inject } from "@loopback/core";

export class DestinationAddressRepository extends DefaultCrudRepository<
  DestinationAddress,
  typeof DestinationAddress.prototype.address
> {
  constructor(
    @inject("datasources.db") protected datasource: juggler.DataSource
  ) {
    super(DestinationAddress, datasource);
  }
}
