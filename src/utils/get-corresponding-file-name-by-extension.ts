export function getCorrespondingFileNameByExtension(filePath:string) {
	if (filePath.endsWith('.html')) {
        return filePath.replace('html', 'scss');
    }
	else if(filePath.endsWith('.scss')) {
		return filePath.replace('scss', 'html');
    }
 
	throw new Error("The corresponding message has not been found");
}