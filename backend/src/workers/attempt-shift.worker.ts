import { currencies } from "../constants/currencies";
import { InputAddress } from "../models/input-address.model";
import { ShiftAttemptRepository } from "../repositories/shift-attempt.repo";
import { repository } from "@loopback/repository";
import { ShapeShift } from "../services/ShapeShift";
import { InputAddressRepository } from "../repositories/input-address.repo";

export class AttemptShiftWorker {
  constructor(
    @repository(ShiftAttemptRepository)
    protected shiftAttemptRepo?: ShiftAttemptRepository,
    @repository(InputAddressRepository)
    protected inputAddrRepo?: InputAddressRepository
  ) {}

  async processPendingShifts() {
    if (!this.inputAddrRepo || !this.shiftAttemptRepo) {
      throw new Error("Repository not available");
    }
    const pendingWork = await this.shiftAttemptRepo.find({
      where: { status: "pending" }
    });

    for (let pendingShift of pendingWork) {
      let inputsToCreate = new Array<InputAddress>();
      if (pendingShift.inputCurrency !== pendingShift.outputCurrency) {
        console.log("Generating shift for ", pendingShift.inputCurrency);
        try {
          this.shiftAttemptRepo.updateById(pendingShift.getId(), {
            status: "in-progress"
          });

          const shapeShift = await ShapeShift.generateShiftAddress(
            pendingShift.address,
            pendingShift.inputCurrency,
            pendingShift.outputCurrency
          );
          console.log(shapeShift);
          if (
            shapeShift.withdrawal.toLowerCase() !==
            pendingShift.address.toLowerCase()
          ) {
            throw new Error(
              "Shapeshift withdrawal address mismatch the destination address. Confidence low, may be exploited"
            );
          }
          const inputAddress = ShapeShift.generateInputAddress(
            shapeShift,
            pendingShift.inputCurrency
          );
          this.inputAddrRepo.create(inputAddress);
          this.shiftAttemptRepo.updateById(pendingShift.getId(), {
            status: "success"
          });
        } catch (err) {
          this.shiftAttemptRepo.updateById(pendingShift.getId(), {
            status: "failed"
          });
          console.error(err);
        }
      }
    }
  }
  start() {
    const taskId = setInterval(this.processPendingShifts.bind(this), 5000);
    console.log("Started AttemptShiftWorker");
  }
}
