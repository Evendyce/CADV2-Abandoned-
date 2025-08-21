import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	return { message: 'Canvas is not supported in this browser.' };
};
