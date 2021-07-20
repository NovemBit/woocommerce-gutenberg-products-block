import {useEffect} from '@wordpress/element';
import {updateAttributeFilter} from '../../../utils/attributes-query';
import {useCollection} from "@woocommerce/base-context/hooks";

const params = [
	'product_cat',
	'attributes',
	'stock_status',
	'min_price',
	'max_price',
	'search'
];

let attributesParams = [];

const cleanURLSearchParams = (urlParams) => {
	let keysForDel = [];
	urlParams.forEach((v, k) => {
		k = encodeURIComponent(k)
		if (v == '' || (k.includes('filter') && !attributesParams.includes(k))) {
			keysForDel.push(k);
		}
	});

	keysForDel.forEach(k => {
		urlParams.delete(decodeURIComponent(k));
	});
	return urlParams;
}

/**
 * @param queryState
 * @param productAttributes
 * @param setProductCat
 * @param setStockStatus
 * @param setAttributes
 * @param setMinPrice
 * @param setMaxPrice
 * @param setSearch
 */
export const generateUrlParams = (queryState, productAttributes, setProductCat, setStockStatus, setAttributes, setMinPrice, setMaxPrice, setSearch) => {
	useEffect(() => {
		const url = new URL(encodeURI(window.location.href));
		let searchParams = url.searchParams;
		searchParams.forEach((value, key) => {
			if (value !== null && !key.includes('_qt')) {
				if (key === 'category') {
					setProductCat(value.split(','));
				} else if (key === 'stock_status') {
					setStockStatus(value.split(','));
				} else if (key === 'min_price') {
					setMinPrice(Number(value));
				} else if (key === 'max_price') {
					setMaxPrice(Number(value));
				} else if ( key === 's' ){
					setSearch( decodeURIComponent( value ) )
				}
			}
		});
	}, []);

	const {results, isLoading} = useCollection({
		namespace: '/wc/store',
		resourceName: 'products/attributes',
		resourceValues: []
	});

	useEffect(() => {
		if (isLoading) {
			return;
		}
		const url = new URL(window.location.href);
		let searchParams = url.searchParams;
		let query = [];
		searchParams.forEach((value, key) => {
			if (value !== null && !key.includes('_qt')) {
				if (key !== 'category' && key !== 'stock_status' && key !== 'min_price' && key !== 'max_price' && key !== 's' && key !== 'post_type') {
					let attributeObject = {};

					let termsSlugs = value.split(',');
					let term, terms = [];
					for (let i = 0; i < termsSlugs.length; i++) {
						term = encodeURIComponent(termsSlugs[i]).toLowerCase();
						terms.push(term)
					}
					attributeObject['attribute'] = key.replace('filter_', 'pa_');
					attributeObject['operator'] = searchParams.get(key + '_qt');
					attributeObject['slug'] = terms;
					query.push(attributeObject);
				}
			}
		});
		setAttributes(query);
	}, [results, isLoading]);

	useEffect(() => {
		if (isLoading) {
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
						let encoded_to_push_attr = encodeURIComponent(to_push_attr);
						//attribute
						if (!attributesParams.includes(encoded_to_push_attr)) {
							attributesParams.push(encoded_to_push_attr);
						}
						if (!attributesParams.includes(encoded_to_push_attr + '_qt')) {
							attributesParams.push(encoded_to_push_attr + '_qt');
						}
						searchParams.set(to_push_attr, decodeURIComponent(attribute.slug).toLowerCase())
						searchParams.set(to_push_attr + '_qt', attribute.operator)
					}
				} else {
					if (queryStateElement === 'product_cat') {
						searchParams.set('category', queryState[queryStateElement])
					}else if( queryStateElement === 'search' ){
						searchParams.set('s', queryState[queryStateElement])
					} else {
						searchParams.set(queryStateElement, queryState[queryStateElement])
					}
				}
				searchParams = cleanURLSearchParams(searchParams);
				url.search = searchParams.toString();
			}
		}
		const new_url = decodeURI(url.toString());
		if (new_url !== window.location.href) {
			window.history.pushState("", "", new_url.replaceAll('%2C', ','));
		}
	}, Object.values(queryState));
}
