/**
 * Parse a string to json
 * @param content The string which should be parsed to json
 * @returns an json object
 */
export function getContentAsJson(content: string) {
	const text = content;
	if (text.trim().length === 0) {
		return '{}';
	}

	try {
		return JSON.parse(text);
	} catch {
		throw new Error('Could not get document as json. Content is not valid json');
	}
}

export function getNonce(): string {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}