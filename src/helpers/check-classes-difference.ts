export function checkClassesDifference(classesArrayA: string[], classesArrayB: string[]): string[] {
    return classesArrayA.filter((className) => !classesArrayB.includes(className));
}
