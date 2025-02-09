import { extractClassesFromSCSS } from './extract-classes-from-scss';

describe('extract-classes-from-scss', () => {
    it('Should return all the classes from the scss file', async () => {
        const classes = await extractClassesFromSCSS(`
                .something {
                    &__content {
                    }
                    &--active {
                        .highlight {
                            &__holy-list {
                                    {}
                                }
                            }
                    }
                    
                    .something-else {}
                }
            `);

        expect(classes).toEqual([
            'something',
            'something__content',
            'something--active',
            'highlight',
            'highlight__holy-list',

            'something-else',
        ]);
    });
});
