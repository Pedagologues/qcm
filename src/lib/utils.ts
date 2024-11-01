export function debounce<T extends unknown[]>(cb: (...args: T) => unknown, wait = 1000) {
	let timeout: NodeJS.Timeout;
	return (...args: T) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => cb(...args), wait);
	};
}
