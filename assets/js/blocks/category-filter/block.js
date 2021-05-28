/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { speak } from '@wordpress/a11y';
import { usePrevious, useShallowEqual } from '@woocommerce/base-hooks';
import {
	useQueryStateByKey,
	useQueryStateByContext,
	useCollectionData,
} from '@woocommerce/base-context/hooks';
import { getSetting } from '@woocommerce/settings';
import { useCallback, useEffect, useState, useMemo } from '@wordpress/element';
import CheckboxList from '@woocommerce/base-components/checkbox-list';
import FilterSubmitButton from '@woocommerce/base-components/filter-submit-button';
import isShallowEqual from '@wordpress/is-shallow-equal';
import { decodeEntities } from '@wordpress/html-entities';

/**
 * Internal dependencies
 */
import Label from './label';
import { previewOptions } from './preview';
import './style.scss';

const CATEGORY_OPTIONS = getSetting( 'categoryOptions', [] );

const initialOptions = Object.entries(
	CATEGORY_OPTIONS
).map( ( [ slug, name ] ) => ( { slug, name } ) );

/**
 * Component displaying an stock status filter.
 *
 * @param {Object} props Incoming props for the component.
 * @param {Object} props.attributes Incoming block attributes.
 * @param {boolean} props.isEditor
 */
const CategoryFilterBlock = ( {
	attributes: blockAttributes,
	isEditor = false,
} ) => {
	const [ checked, setChecked ] = useState( [] );
	const [ displayedOptions, setDisplayedOptions ] = useState(
		blockAttributes.isPreview ? previewOptions : []
	);

	const [ queryState ] = useQueryStateByContext();
	const [
		productCategoryQuery,
		setProductCategoryQuery,
	] = useQueryStateByKey( 'category', [] );

	 results = 5;
	isLoading = false;
	const {
		results: filteredCounts,
		isLoading: filteredCountsLoading,
	} = useCollectionData( {
		queryCategory: true,
		queryState,
	} );

	/**
	 * Get count data about a given status by slug.
	 */
	const getFilteredStock = useCallback(
		( slug ) => {
			if ( ! filteredCounts.category_counts ) {
				return null;
			}
			return filteredCounts.category_counts.find(
				( { status, count } ) =>
					status === slug && Number( count ) !== 0
			);
		},
		[ filteredCounts ]
	);

	/**
	 * Compare intersection of all stock statuses and filtered counts to get a list of options to display.
	 */
	useEffect( () => {
		/**
		 * Checks if a status slug is in the query state.
		 *
		 * @param {string} queryStatus The status slug to check.
		 */
		const isCategoryInQueryState = ( queryStatus ) => {
			if ( ! queryState?.category ) {
				return false;
			}
			return queryState.category.some( ( { category = [] } ) =>
				category.includes( queryStatus )
			);
		};

		if ( filteredCountsLoading || blockAttributes.isPreview ) {
			return;
		}

		const newOptions = initialOptions
			.map( ( status ) => {
				const filteredStock = getFilteredStock( status.slug );

				if (
					! filteredStock &&
					! checked.includes( status.slug ) &&
					! isCategoryInQueryState( status.slug )
				) {
					return null;
				}

				const count = filteredStock ? Number( filteredStock.count ) : 0;

				return {
					value: status.slug,
					name: decodeEntities( status.name ),
					label: (
						<Label
							name={ decodeEntities( status.name ) }
							count={ blockAttributes.showCounts ? count : null }
						/>
					),
				};
			} )
			.filter( Boolean );

		setDisplayedOptions( newOptions );
	}, [
		blockAttributes.showCounts,
		blockAttributes.isPreview,
		filteredCountsLoading,
		getFilteredStock,
		checked,
		queryState.category,
	] );

	const onSubmit = useCallback(
		( isChecked ) => {
			if ( isEditor ) {
				return;
			}
			if ( isChecked ) {
				setProductCategoryQuery( checked );
			}
		},
		[ isEditor, setProductCategoryQuery, checked ]
	);

	// Track checked STATE changes - if state changes, update the query.
	useEffect( () => {
		if ( ! blockAttributes.showFilterButton ) {
			onSubmit( checked );
		}
	}, [ blockAttributes.showFilterButton, checked, onSubmit ] );

	const checkedQuery = useMemo( () => {
		return productCategoryQuery;
	}, [ productCategoryQuery ] );

	const currentCheckedQuery = useShallowEqual( checkedQuery );
	const previousCheckedQuery = usePrevious( currentCheckedQuery );
	// Track Stock query changes so the block reflects current filters.
	useEffect( () => {
		if (
			! isShallowEqual( previousCheckedQuery, currentCheckedQuery ) && // checked query changed
			! isShallowEqual( checked, currentCheckedQuery ) // checked query doesn't match the UI
		) {
			setChecked( currentCheckedQuery );
		}
	}, [ checked, currentCheckedQuery, previousCheckedQuery ] );

	/**
	 * When a checkbox in the list changes, update state.
	 */
	const onChange = useCallback(
		( checkedValue ) => {
			const getFilterNameFromValue = ( filterValue ) => {
				const { name } = displayedOptions.find(
					( option ) => option.value === filterValue
				);

				return name;
			};

			const announceFilterChange = ( { filterAdded, filterRemoved } ) => {
				const filterAddedName = filterAdded
					? getFilterNameFromValue( filterAdded )
					: null;
				const filterRemovedName = filterRemoved
					? getFilterNameFromValue( filterRemoved )
					: null;
				if ( filterAddedName && filterRemovedName ) {
					speak(
						sprintf(
							/* translators: %1$s and %2$s are stock statuses (for example: 'instock'...). */
							__(
								'%1$s filter replaced with %2$s.',
								'woo-gutenberg-products-block'
							),
							filterAddedName,
							filterRemovedName
						)
					);
				} else if ( filterAddedName ) {
					speak(
						sprintf(
							/* translators: %s stock statuses (for example: 'instock'...) */
							__(
								'%s filter added.',
								'woo-gutenberg-products-block'
							),
							filterAddedName
						)
					);
				} else if ( filterRemovedName ) {
					speak(
						sprintf(
							/* translators: %s stock statuses (for example:'instock'...) */
							__(
								'%s filter removed.',
								'woo-gutenberg-products-block'
							),
							filterRemovedName
						)
					);
				}
			};

			const previouslyChecked = checked.includes( checkedValue );

			const newChecked = checked.filter(
				( value ) => value !== checkedValue
			);

			if ( ! previouslyChecked ) {
				newChecked.push( checkedValue );
				newChecked.sort();
				announceFilterChange( { filterAdded: checkedValue } );
			} else {
				announceFilterChange( { filterRemoved: checkedValue } );
			}

			setChecked( newChecked );
		},
		[ checked, displayedOptions ]
	);

	if ( displayedOptions.length === 0 ) {
		return null;
	}

	const TagName = `h${ blockAttributes.headingLevel }`;
	const isLoading = ! blockAttributes.isPreview && ! CATEGORY_OPTIONS;
	const isDisabled = ! blockAttributes.isPreview && filteredCountsLoading;

	return (
		<>
			{ ! isEditor && blockAttributes.heading && (
				<TagName>{ blockAttributes.heading }</TagName>
			) }
			<div className="wc-block-category-filter">
				<CheckboxList
					className={ 'wc-block-category-filter-list' }
					options={ displayedOptions }
					checked={ checked }
					onChange={ onChange }
					isLoading={ isLoading }
					isDisabled={ isDisabled }
				/>
				{ blockAttributes.showFilterButton && (
					<FilterSubmitButton
						className="wc-block-category-filter__button"
						disabled={ isLoading || isDisabled }
						onClick={ () => onSubmit( checked ) }
					/>
				) }
			</div>
		</>
	);
};

export default CategoryFilterBlock;
