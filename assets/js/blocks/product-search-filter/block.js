/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import {
	useQueryStateByKey,
} from '@woocommerce/base-context/hooks';
import { useCallback, useEffect, useState, useMemo } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './style.scss';

/**
 * Component displaying an stock status filter.
 *
 * @param {Object} props Incoming props for the component.
 * @param {Object} props.attributes Incoming block attributes.
 * @param {boolean} props.isEditor
 */
const ProductSearchFilterBlock = ( {
	attributes: blockAttributes,
	isEditor = false,
} ) => {
	const [ search, setSearch ] = useState("");
	const [ searchInput, setSearchInput ] = useState("");

	const [
		productSearchQuery,
		setProductSearchQuery,
	] = useQueryStateByKey( 'search', '' );

	const onChange = useCallback(
		( e  ) => {
			setSearch( e.target.value )
			setSearchInput( e )
		},
		[ search, setSearch ]
	);

	const onSubmit = () => {
		setProductSearchQuery( search )
	}

	useEffect( () => {
		if( searchInput.target === undefined ){
			return;
		}
		searchInput.target.value = productSearchQuery;
	}, [ productSearchQuery ] );

	const TagName = `h${ blockAttributes.headingLevel }`;

	return (
		<>
			{ ! isEditor && blockAttributes.heading && (
				<TagName>{ blockAttributes.heading }</TagName>
			) }
			<div className="wp-block-woocommerce-product-search-filter">
				<input
					type="text"
					className="wc-block-product-search__field"
					// placeholder={ placeholder }
					onChange={ e => onChange( e ) }
				/>
				<button
					type="button"
					className="wc-block-product-search__button"
					onClick={ () => onSubmit() }
					label={ __( 'Search', 'woo-gutenberg-products-block' ) }
				>
					<svg
						aria-hidden="true"
						role="img"
						focusable="false"
						className="dashicon dashicons-arrow-right-alt2"
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 20 20"
					>
						<path d="M6 15l5-5-5-5 1-2 7 7-7 7z" />
					</svg>
				</button>
			</div>
		</>
	);
};

export default ProductSearchFilterBlock;
