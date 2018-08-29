import { AttemptShiftWorker } from "./attempt-shift.worker";
export class WorkersService {
  start() {
    new AttemptShiftWorker().start();
  }
}

export const Workers = new WorkersService();
