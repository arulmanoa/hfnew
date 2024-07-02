// import { global } from "@angular/core/src/util";

export class InstanceLoader{
    constructor(private context: Object) {

    }

    getInstance<T>(name: string, ...args: any[]) : T {

        console.log("window ::" , this.context);

        var instance = Object.create(window[name].prototype);
        // var instance = new (<any>global)[name]();
        // var instance =  new global[name]();
        instance.constructor.apply(instance, args);
        console.log("INstance ::" , instance);
        return <T> instance;
    }

    

    // getInstance(name: string, ...args: any[]) : any{
    //     var instance = Object.create(this.context[name].prototype);
    //     instance.constructor.apply(instance, args);
    //     return  instance;
    // }
}

