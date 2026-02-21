import { assertNumber } from "./asserts.js";

export function assertUser(day: number, happiness: number, sprouts: number): string {
    let error = '';
    if (!day || !assertNumber(day)) {
        error = 'There was a problem with the day parameter.';
    }
    if (!happiness || !assertNumber(happiness)) {
        error = 'There was a problem with the happiness parameter.';
    }
    if (!sprouts || !assertNumber(sprouts)) {
        error = 'There was a problem with the sprouts parameter.'
    }
    return error;
}