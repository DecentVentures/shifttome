// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';

import * as request from "request";
import { DestinationAddressRepository } from "../repositories";
import { repository } from "@loopback/repository";
import { post, requestBody } from "@loopback/openapi-v3";
import { DestinationAddress } from "../models";
import { HttpErrors } from "@loopback/rest";
import { currencies } from "../constants/currencies";
import { InputAddressRepository } from "../repositories/input-address.repo";
import { get } from "@loopback/openapi-v3/dist8/src/decorators/operation.decorator";
import { param } from "@loopback/openapi-v3/dist8/src/decorators/parameter.decorator";
import { Filter } from "@loopback/repository/dist8/src/query";
import { InputAddress } from "../models/input-address.model";

export type ShapeShiftResponse = {
  deposit: string;
  depositType: string;
  withdrawal: string;
  withdrawalType: string;
  public: string;
  xrpDestTag: string;
  apiPubKey: string;
};

export class DestinationAddressController {
  constructor(
    @repository(DestinationAddressRepository)
    protected destAddrRepo: DestinationAddressRepository,
    @repository(InputAddressRepository)
    protected inputAddrRepo: InputAddressRepository
  ) {}

  @get("/destination/{address}")
  async getDestinationAddress(@param.path.string("address") addr: string) {
    const query = { address: addr };
    const destination = this.destAddrRepo.findOne({ where: query });
    if (!destination) {
      throw new HttpErrors.BadRequest(`Could not find address ${addr}`);
    } else {
      return destination;
    }
  }

  @post("/destination")
  async registerDestinationAddress(
    @requestBody() destination: DestinationAddress
  ) {
    if (!destination.address || !destination.currency) {
      throw new HttpErrors.BadRequest(
        "Currency and address are required to register"
      );
    } else {
      await this.destAddrRepo.create(destination);
      if (destination.inputs) {
        for (let input of destination.inputs) {
          if (!input.shift_to || input.shift_to !== destination.address) {
            input.shift_to = destination.address;
          }
          await this.inputAddrRepo.create(input);
        }
      } else {
        let inputsToCreate = new Array<InputAddress>();
        for (let currency in currencies) {
          if (currency !== destination.currency) {
            const shapeShift = await this.generateShiftAddress(
              destination.address,
              currency,
              destination.currency
            );
            if(shapeShift.withdrawal !== destination.address) {
              throw new Error('Shapeshift withdrawal address mismatch the destination address')
            }
            const inputAddress = new InputAddress();
            inputAddress.address = shapeShift.deposit;
            inputAddress.currency = currency;
            inputAddress.shift_to = shapeShift.withdrawal;
            inputsToCreate.push(inputAddress);
          }
        }
        await this.inputAddrRepo.createAll(inputsToCreate);
      }
    }
  }

  async generateShiftAddress(
    outputAddress: string,
    inputCurrency: string,
    outputCurrency: string
  ): Promise<ShapeShiftResponse> {
    let shiftData = {
      url: "https://cors.shapeshift.io/shift",
      json: true,
      form: {
        withdrawal: outputAddress,
        reusable: true,
        pair: this.toPair(inputCurrency, outputCurrency),
        apiKey:
          "1f9ee3ebe9981113690c90520434cdb361bd838ddb057ef40ff0b786c00906219e0c1ca9429cb1445ccd8e8935f55661c2ad334ee34514744634e52ffb1c9e1e"
      }
    };
    return new Promise<ShapeShiftResponse>((resolve, reject) => {
      request.post(shiftData, (err, http, body: ShapeShiftResponse) => {
        if (err) {
          reject(err);
        } else {
          resolve(body);
        }
      });
    });
  }

  toPair(inputCurrency: string, outputCurrency: string) {
    const currencyValues = Object.values(currencies);
    const findCurrency = (cur: string) =>
      currencyValues.find(
        currency =>
          currency.name.toLowerCase() === cur.toLowerCase() ||
          currency.symbol === cur.toLowerCase()
      );
    const input = findCurrency(inputCurrency);
    const output = findCurrency(outputCurrency);
    if (!input || !output) {
      throw new Error("both input and output currencies must exist");
    }
    return `${input.symbol}_${output.symbol}`.toLowerCase();
  }
}
