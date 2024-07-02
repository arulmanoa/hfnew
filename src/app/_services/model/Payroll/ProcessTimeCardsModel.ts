import { PayrollQueueMessage } from "./PayrollQueueMessage";
import { ProcessCategory } from "./PayRun";

export class ProcessTimeCardsModel{
    MsgsList : PayrollQueueMessage[];
    ProcessCategory : ProcessCategory;
}