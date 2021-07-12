import {useEffect} from '@wordpress/element';
import {updateAttributeFilter} from '../../../utils/attributes-query';
import {useCollection} from "@woocommerce/base-context/hooks";

const params = [
	'product_cat',
	'attributes',
	'stock_status',
	'min_price',
	'max_price'
];

let attributesParams = [];

const cleanURLSearchParams = (urlParams) => {
	let keysForDel = [];
	urlParams.forEach((v, k) => {
		if (v == '' || ( k.includes('filter') && !attributesParams.includes(k) ) ) {
			keysForDel.push(k);
		}
	});
	keysForDel.forEach(k => {
		urlParams.delete(k);
	});
	return urlParams;
}

/**
 * @param queryState
 * @param setProductCat
 * @param setStockStatus
 * @param setAttributes
 * @param setMinPrice
 * @param setMaxPrice
 */
export const generateUrlParams = (queryState, productAttributes, setProductCat, setStockStatus, setAttributes, setMinPrice, setMaxPrice) => {
	useEffect(() => {
		const url = new URL(window.location.href);
		let searchParams = url.searchParams;
		searchParams.forEach((value, key) => {
			if (value !== null && !key.includes('_qt')) {
				if (key === 'product_cat') {
					setProductCat(value.split(','));
				} else if (key === 'stock_status') {
					setStockStatus(value.split(','));
				} else if (key === 'min_price') {
					setMinPrice(Number(value));
				} else if (key === 'max_price') {
					setMaxPrice(Number(value));
				}
			}
		});
	}, []);

	const { results, isLoading } = useCollection( {
		namespace: '/wc/store',
		resourceName: 'products/attributes',
		resourceValues: []
	} );

	useEffect(() => {
		if ( isLoading ) {
			return;
		}
		const url = new URL(window.location.href);
		let searchParams = url.searchParams;
		let attributeObject = {};
		searchParams.forEach((value, key) => {
			if (value !== null && !key.includes('_qt')) {
				if ( key !== 'product_cat' && key !== 'stock_status' && key !== 'min_price' && key !== 'max_price' ) {
					attributeObject['taxonomy'] = key.replace('filter_', 'pa_');
					let termsSlugs = value.split(',');
					let term, terms = [];
					for (let i = 0; i < termsSlugs.length; i++) {
						term = {};
						term.slug = termsSlugs[i];
						terms.push(term)
					}
					updateAttributeFilter(
						productAttributes,
						setAttributes,
						attributeObject,
						terms,
						searchParams.get(key + '_qt')
					);
				}
			}
		});
	}, [results, isLoading]);

	useEffect(() => {
		if ( isLoading ) {
			return;
		}
		const url = new URL(window.location.href);
		let searchParams = url.searchParams;
		if (queryState.min_price === undefined) {
			searchParams.delete('min_price');
		}
		if (queryState.max_price === undefined) {
			searchParams.delete('max_price');
		}
		for (const queryStateElement in queryState) {
			if (params.includes(queryStateElement)) {
				//set url params
				if (queryStateElement === 'attributes') {
					attributesParams = [];
					for (const attribute of queryState[queryStateElement]) {
						let to_push_attr = attribute.attribute.replace('pa_', 'filter_');
						//attribute
						if (!attributesParams.includes(to_push_attr)) {
							attributesParams.push(to_push_attr);
						}
						if (!attributesParams.includes(to_push_attr + '_qt')) {
							attributesParams.push(to_push_attr + '_qt');
						}
						searchParams.set(to_push_attr, attribute.slug)
						searchParams.set(to_push_attr + '_qt', attribute.operator)
					}
				} else {
					searchParams.set(queryStateElement, queryState[queryStateElement])
				}
				searchParams = cleanURLSearchParams(searchParams);
				url.search = searchParams.toString();
			}
		}
		const new_url = url.toString();
		if (new_url !== window.location.href) {
			window.history.pushState("", "", new_url.replaceAll('%2C', ','));
		}
	}, Object.values(queryState));
}
