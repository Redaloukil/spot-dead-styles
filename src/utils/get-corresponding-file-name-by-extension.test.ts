import { getCorrespondingFileNameByExtension } from './get-corresponding-file-name-by-extension';

describe('getCorrespondingFileNameByExtension', () => {
    it('should return the style file name of the html file', () => {
        const styleFileName = getCorrespondingFileNameByExtension(
            'my-component-example.component.html'
        );
        expect(styleFileName).toEqual('my-component-example.component.scss');
    });

    it('should return the template file name of the html file', () => {
        const htmlFileName = getCorrespondingFileNameByExtension(
            'my-component-example.component.scss'
        );
        expect(htmlFileName).toEqual('my-component-example.component.html');
    });
});
