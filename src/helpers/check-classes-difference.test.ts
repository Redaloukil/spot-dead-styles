import { checkClassesDifference } from './check-classes-difference';

describe('checkClasses', () => {
    it('should return an empty array', () => {
        const classesA = ['something', 'else', 'going'];
        const classesB = ['something', 'else', 'going', 'on'];

        expect(checkClassesDifference(classesA, classesB)).toEqual([]);
    });
    it('should return an array containing the missing classes', () => {
        const classesA = ['something', 'else', 'going'];
        const classesB = ['something', 'else'];

        expect(checkClassesDifference(classesA, classesB)).toEqual(['going']);
    });
});
