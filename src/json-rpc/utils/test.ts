import { expect } from 'chai';

/**
 * This method is compairing two js objects deeply.
 * Due to the usage of json, field ordering is crucial.
 * @param obj1 - First object
 * @param obj2 - Second object
 */
export function assertObjectDeepEqual(obj1: Object, obj2: Object): void {
    expect(JSON.stringify(obj1)).to.be.equal(JSON.stringify(obj2));
}