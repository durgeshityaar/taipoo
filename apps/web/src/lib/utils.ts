import { createCn } from "cn/config";
import { defaultConfig } from "tailwind-variants";

// Our type roles (layout.css → @theme --text-*) are font sizes. Unregistered, the class mergers read
// `text-eyebrow` as a color and drop it next to `text-muted-foreground` (or vice versa).
const typeRoles = ["heading-1", "heading-2", "heading-3", "title", "title-sm", "body-md", "body-sm", "caption", "nav", "eyebrow"];
const mergeConfig = { extend: { classGroups: { "font-size": [{ text: typeRoles }] } } };

export const cn = createCn(mergeConfig);
// tv() reads this when a component module defines its variants. Every ui file using tv() also imports
// this module, and imports evaluate before the module body, so it's always set in time.
defaultConfig.twMergeConfig = mergeConfig;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

// SvelteKit hands a page the next route's `data` just before unmounting it, so for that moment anything the next
// route doesn't load is undefined, and deriveds that read it throw and abort the navigation. Wrap such values:
// `const form = $derived(lastForm(data.form))` keeps the last real value through that moment.
export function keepLast<T>() {
	let last: T;
	return (value: T | undefined): T => (value === undefined ? last : (last = value));
}
