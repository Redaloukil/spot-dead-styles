import { checkClasses } from './check-classes';

describe('checkClasses', () => {
    it('should return an empty array', () => {
        const classesA = ['something', 'else', 'going'];
        const classesB = ['something', 'else', 'going', 'on'];

        expect(checkClasses(classesA, classesB)).toEqual([]);
    });
    it('should return an array containing the missing classes', () => {
        const classesA = ['something', 'else', 'going'];
        const classesB = ['something', 'else'];

        expect(checkClasses(classesA, classesB)).toEqual(['going']);
    });
});
