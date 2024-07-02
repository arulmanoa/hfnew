import { Injectable } from '@angular/core';

export class Task {
    Id: number;
    Assigned: string;
    Subject: string;
}


const tasks: Task[] = [{
    Id: 1,
    Assigned: 'Mr. John Heart',
    Subject: 'Choose between PPO and HMO Health Plan'
}, {
    Id: 2,
    Assigned: 'Mr. John Heart',
    Subject: 'Google AdWords Strategy'
}, {
    Id: 3,
    Assigned: 'Mr. John Heart',
    Subject: 'New Brochures'
}, {
    Id: 4,
    Assigned: 'Mr. John Heart',
    Subject: 'Update NDA Agreement'
}, {
    Id: 5,
    Assigned: 'Mr. John Heart',
    Subject: 'Review Product Recall Report by Engineering Team'
}];

@Injectable()
export class SampleService {

    getTasks(): Task[] {
        return tasks;
    }

}


