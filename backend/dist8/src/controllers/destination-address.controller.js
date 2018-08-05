"use strict";
// Uncomment these imports to begin using these cool features!
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
// import {inject} from '@loopback/context';
const request = require("request");
const repositories_1 = require("../repositories");
const repository_1 = require("@loopback/repository");
const openapi_v3_1 = require("@loopback/openapi-v3");
const models_1 = require("../models");
const rest_1 = require("@loopback/rest");
const currencies_1 = require("../constants/currencies");
const input_address_repo_1 = require("../repositories/input-address.repo");
const operation_decorator_1 = require("@loopback/openapi-v3/dist8/src/decorators/operation.decorator");
const parameter_decorator_1 = require("@loopback/openapi-v3/dist8/src/decorators/parameter.decorator");
const input_address_model_1 = require("../models/input-address.model");
let DestinationAddressController = class DestinationAddressController {
    constructor(destAddrRepo, inputAddrRepo) {
        this.destAddrRepo = destAddrRepo;
        this.inputAddrRepo = inputAddrRepo;
    }
    async getDestinationAddress(addr) {
        const query = { address: addr };
        const destination = this.destAddrRepo.findOne({ where: query });
        if (!destination) {
            throw new rest_1.HttpErrors.BadRequest(`Could not find address ${addr}`);
        }
        else {
            return destination;
        }
    }
    async registerDestinationAddress(destination) {
        if (!destination.address || !destination.currency) {
            throw new rest_1.HttpErrors.BadRequest("Currency and address are required to register");
        }
        else {
            await this.destAddrRepo.create(destination);
            if (destination.inputs) {
                for (let input of destination.inputs) {
                    if (!input.shift_to || input.shift_to !== destination.address) {
                        input.shift_to = destination.address;
                    }
                    await this.inputAddrRepo.create(input);
                }
            }
            else {
                let inputsToCreate = new Array();
                for (let currency in currencies_1.currencies) {
                    if (currency !== destination.currency) {
                        const shapeShift = await this.generateShiftAddress(destination.address, currency, destination.currency);
                        if (shapeShift.withdrawal !== destination.address) {
                            throw new Error('Shapeshift withdrawal address mismatch the destination address');
                        }
                        const inputAddress = new input_address_model_1.InputAddress();
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
    async generateShiftAddress(outputAddress, inputCurrency, outputCurrency) {
        let shiftData = {
            url: "https://cors.shapeshift.io/shift",
            json: true,
            form: {
                withdrawal: outputAddress,
                reusable: true,
                pair: this.toPair(inputCurrency, outputCurrency),
                apiKey: "1f9ee3ebe9981113690c90520434cdb361bd838ddb057ef40ff0b786c00906219e0c1ca9429cb1445ccd8e8935f55661c2ad334ee34514744634e52ffb1c9e1e"
            }
        };
        return new Promise((resolve, reject) => {
            request.post(shiftData, (err, http, body) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(body);
                }
            });
        });
    }
    toPair(inputCurrency, outputCurrency) {
        const currencyValues = Object.values(currencies_1.currencies);
        const findCurrency = (cur) => currencyValues.find(currency => currency.name.toLowerCase() === cur.toLowerCase() ||
            currency.symbol === cur.toLowerCase());
        const input = findCurrency(inputCurrency);
        const output = findCurrency(outputCurrency);
        if (!input || !output) {
            throw new Error("both input and output currencies must exist");
        }
        return `${input.symbol}_${output.symbol}`.toLowerCase();
    }
};
__decorate([
    operation_decorator_1.get("/destination/{address}"),
    __param(0, parameter_decorator_1.param.path.string("address")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DestinationAddressController.prototype, "getDestinationAddress", null);
__decorate([
    openapi_v3_1.post("/destination"),
    __param(0, openapi_v3_1.requestBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [models_1.DestinationAddress]),
    __metadata("design:returntype", Promise)
], DestinationAddressController.prototype, "registerDestinationAddress", null);
DestinationAddressController = __decorate([
    __param(0, repository_1.repository(repositories_1.DestinationAddressRepository)),
    __param(1, repository_1.repository(input_address_repo_1.InputAddressRepository)),
    __metadata("design:paramtypes", [repositories_1.DestinationAddressRepository,
        input_address_repo_1.InputAddressRepository])
], DestinationAddressController);
exports.DestinationAddressController = DestinationAddressController;
//# sourceMappingURL=destination-address.controller.js.map