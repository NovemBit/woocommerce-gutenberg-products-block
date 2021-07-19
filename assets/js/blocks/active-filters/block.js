/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { useQueryStateByKey } from '@woocommerce/base-context/hooks';
import { getSetting } from '@woocommerce/settings';
import { useMemo } from '@wordpress/element';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import Label from '@woocommerce/base-components/label';

/**
 * Internal dependencies
 */
import './style.scss';
import { getAttributeFromTaxonomy } from '../../utils/attributes';
import { formatPriceRange, renderRemovableListItem } from './utils';
import ActiveAttributeFilters from './active-attribute-filters';

/**
 * Component displaying active filters.
 *
 * @param {Object} props Incoming props for the component.
 * @param {Object} props.attributes Incoming attributes for the block.
 * @param {boolean} props.isEditor Whether or not in the editor context.
 */
const ActiveFiltersBlock = ( {
	attributes: blockAttributes,
	isEditor = false,
} ) => {
	const [ productAttributes, setProductAttributes ] = useQueryStateByKey(
		'attributes',
		[]
	);
	const [ productStockStatus, setProductStockStatus ] = useQueryStateByKey(
		'stock_status',
		''
	);
	const [
		productSearchQuery,
		setProductSearchQuery,
	] = useQueryStateByKey( 'search', [] );

	const [
		productCategoryQuery,
		setProductCategoryQuery,
	] = useQueryStateByKey( 'product_cat', [] );

	const [ minPrice, setMinPrice ] = useQueryStateByKey( 'min_price' );
	const [ maxPrice, setMaxPrice ] = useQueryStateByKey( 'max_price' );

	const activeSearchFilters = useMemo ( () => {
		if( productSearchQuery.length > 0 ){
			return renderRemovableListItem( {
				type: __( 'Search', 'woo-gutenberg-products-block' ),
				name: sprintf(  __( 'Search: %s', 'woo-gutenberg-products-block' ), productSearchQuery ),
				removeCallback: () => {
					setProductSearchQuery( '' );
				},
				displayStyle: blockAttributes.displayStyle,
			} );
		}
	}, [
		productSearchQuery,
		setProductSearchQuery,
	]);

	const STOCK_STATUS_OPTIONS = getSetting( 'stockStatusOptions', [] );
	const activeStockStatusFilters = useMemo( () => {
		if ( productStockStatus.length > 0 ) {
			return productStockStatus.map( ( slug ) => {
				return renderRemovableListItem( {
					type: __( 'Stock Status', 'woo-gutenberg-products-block' ),
					name: STOCK_STATUS_OPTIONS[ slug ],
					removeCallback: () => {
						const newStatuses = productStockStatus.filter(
							( status ) => {
								return status !== slug;
							}
						);
						setProductStockStatus( newStatuses );
					},
					displayStyle: blockAttributes.displayStyle,
				} );
			} );
		}
	}, [
		STOCK_STATUS_OPTIONS,
		productStockStatus,
		setProductStockStatus,
		blockAttributes.displayStyle,
	] );
	const CATEGORY_OPTIONS = getSetting( 'categoryOptions', [] );
	const activeCategoryFilters = useMemo( () => {
		if ( productCategoryQuery.length > 0 ) {
			return productCategoryQuery.map( ( id ) => {
				return renderRemovableListItem( {
					type: __( 'Category', 'woo-gutenberg-products-block' ),
					name: CATEGORY_OPTIONS[ id ].name,
					removeCallback: () => {
						const newOptions = productCategoryQuery.filter(
							( cat ) => {
								return cat !== id;
							}
						);
						setProductCategoryQuery( newOptions );
					},
					displayStyle: blockAttributes.displayStyle,
				} );
			} );
		}
	}, [
		CATEGORY_OPTIONS,
		productCategoryQuery,
		setProductCategoryQuery,
		blockAttributes.displayStyle,
	] );

	const activePriceFilters = useMemo( () => {
		if ( ! Number.isFinite( minPrice ) && ! Number.isFinite( maxPrice ) ) {
			return null;
		}
		return renderRemovableListItem( {
			type: __( 'Price', 'woo-gutenberg-products-block' ),
			name: formatPriceRange( minPrice, maxPrice ),
			removeCallback: () => {
				setMinPrice( undefined );
				setMaxPrice( undefined );
			},
			displayStyle: blockAttributes.displayStyle,
		} );
	}, [
		minPrice,
		maxPrice,
		blockAttributes.displayStyle,
		setMinPrice,
		setMaxPrice,
	] );

	const activeAttributeFilters = useMemo( () => {
		return productAttributes.map( ( attribute ) => {
			const attributeObject = getAttributeFromTaxonomy(
				attribute.attribute
			);
			return (
				<ActiveAttributeFilters
					attributeObject={ attributeObject }
					displayStyle={ blockAttributes.displayStyle }
					slugs={ attribute.slug }
					key={ attribute.attribute }
					operator={ attribute.operator }
				/>
			);
		} );
	}, [ productAttributes, blockAttributes.displayStyle ] );

	const hasFilters = () => {
		return (
			productAttributes.length > 0 ||
			productStockStatus.length > 0 ||
			productSearchQuery.length > 0 ||
			productCategoryQuery.length > 0 ||
			Number.isFinite( minPrice ) ||
			Number.isFinite( maxPrice )
		);
	};

	if ( ! hasFilters() && ! isEditor ) {
		return null;
	}

	const TagName = `h${ blockAttributes.headingLevel }`;
	const listClasses = classnames( 'wc-block-active-filters__list', {
		'wc-block-active-filters__list--chips':
			blockAttributes.displayStyle === 'chips',
	} );

	return (
		<>
			{ ! isEditor && blockAttributes.heading && (
				<TagName>{ blockAttributes.heading }</TagName>
			) }
			<div className="wc-block-active-filters">
				<ul className={ listClasses }>
					{ isEditor ? (
						<>
							{ renderRemovableListItem( {
								type: __(
									'Size',
									'woo-gutenberg-products-block'
								),
								name: __(
									'Small',
									'woo-gutenberg-products-block'
								),
								displayStyle: blockAttributes.displayStyle,
							} ) }
							{ renderRemovableListItem( {
								type: __(
									'Color',
									'woo-gutenberg-products-block'
								),
								name: __(
									'Blue',
									'woo-gutenberg-products-block'
								),
								displayStyle: blockAttributes.displayStyle,
							} ) }
						</>
					) : (
						<>
							{ activePriceFilters }
							{ activeStockStatusFilters }
							{ activeSearchFilters }
							{ activeCategoryFilters }
							{ activeAttributeFilters }
						</>
					) }
				</ul>
				<button
					className="wc-block-active-filters__clear-all"
					onClick={ () => {
						setMinPrice( undefined );
						setMaxPrice( undefined );
						setProductCategoryQuery( [] );
						setProductAttributes( [] );
						setProductStockStatus( [] );
						setProductSearchQuery( [] );
					} }
				>
					<Label
						label={ __(
							'Clear All',
							'woo-gutenberg-products-block'
						) }
						screenReaderLabel={ __(
							'Clear All Filters',
							'woo-gutenberg-products-block'
						) }
					/>
				</button>
			</div>
		</>
	);
};

ActiveFiltersBlock.propTypes = {
	/**
	 * The attributes for this block.
	 */
	attributes: PropTypes.object.isRequired,
	/**
	 * Whether it's in the editor or frontend display.
	 */
	isEditor: PropTypes.bool,
};

export default ActiveFiltersBlock;
