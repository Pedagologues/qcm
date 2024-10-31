import { get, writable, type Writable } from 'svelte/store';

export function derived_writable<S, T>(
	store: Writable<S>,
	read: () => T,
	write: (v: T) => void
): Writable<T> {
	const derived: Writable<T> = writable(read());

	store.subscribe(() => {
		const o = read();
		if (o != get(derived)) derived.set(read());
	});

	derived.subscribe((v) => {
		const o = read();
		if (o != v) write(v);
	});

	return derived;
}
