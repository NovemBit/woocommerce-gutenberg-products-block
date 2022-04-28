/**
 * External dependencies
 */
import {
	useStoreProducts,
	useSynchronizedQueryState,
} from '@woocommerce/base-context/hooks';
import {useEffect, useState} from '@wordpress/element';

/**
 * Internal dependencies
 */
import ProductSortSelect from '../../base/components/product-list/product-sort-select';

// import { previewOptions } from './preview';
import './style.scss';

/**
 * Component displaying an stock status filter.
 *
 * @param {Object} props Incoming props for the component.
 * @param {Object} props.attributes Incoming block attributes.
 * @param {boolean} props.isEditor
 */
const StockStatusFilterBlock = ({
									attributes: blockAttributes,
									isEditor = false,
								}) => {
	const getSortArgs = (orderName) => {
		switch (orderName) {
			case 'menu_order':
			case 'popularity':
			case 'rating':
			case 'price':
				return {
					orderby: orderName,
					order: 'asc',
				};
			case 'price-desc':
				return {
					orderby: 'price',
					order: 'desc',
				};
			case 'date':
				return {
					orderby: 'date',
					order: 'desc',
				};
		}
	};

	const [currentSort, setSort] = useState();
	const [defaultSort, setDefaultSort] = useState();
	const [queryState] = useSynchronizedQueryState({
		...getSortArgs(currentSort),
	});

	useEffect(() => {
		console.log( queryState )
		if (queryState.orderby !== "undefined") {
			setDefaultSort(queryState.orderby);
		}
	}, [queryState])

	const {products, productsLoading} = useStoreProducts(queryState);

	const onSortChange = (event) => {
		const newSortValue = event.target.value;
		setSort(newSortValue);
	};

	const TagName = `h${blockAttributes.headingLevel}`;
	const hasProducts = products.length !== 0 || productsLoading;

	return (
		<>
			{hasProducts && (
				<>
					{!isEditor && blockAttributes.heading && (
						<TagName>{blockAttributes.heading}</TagName>
					)}
					{defaultSort &&
						<div className="wc-block-product-sorting">
							<ProductSortSelect
								defaultValue={defaultSort}
								onChange={onSortChange}
								value={currentSort}
							/>
						</div>
					}
				</>
			)}
		</>
	);
};

export default StockStatusFilterBlock;
