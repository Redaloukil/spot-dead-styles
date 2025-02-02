export function checkClasses(classesArrayA:string[], classesArrayB:string[]) {
    const classesOnArrayAOnly:string[] = [];

    classesArrayA.forEach((className) => {
        if (!classesArrayB.includes(className) ) {
            classesOnArrayAOnly.push(className);
        } 
    });

    return classesOnArrayAOnly;
}