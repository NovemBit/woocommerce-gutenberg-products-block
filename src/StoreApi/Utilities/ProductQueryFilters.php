<?php

namespace Automattic\WooCommerce\Blocks\StoreApi\Utilities;

use Automattic\WooCommerce\Blocks\StoreApi\Utilities\ProductQuery;

/**
 * Product Query filters class.
 *
 * @internal This API is used internally by Blocks--it is still in flux and may be subject to revisions.
 * @since 2.5.0
 */
class ProductQueryFilters
{
	/**
	 * Get filtered min price for current products.
	 *
	 * @param  \WP_REST_Request  $request  The request object.
	 *
	 * @return array
	 */
	public function get_filtered_price($request)
	{
		global $wpdb;

		// Regenerate the products query without min/max price request params.
		unset($request['min_price'], $request['max_price']);

		// Grab the request from the WP Query object, and remove SQL_CALC_FOUND_ROWS and Limits so we get a list of all products.
		$product_query = new ProductQuery();

		add_filter('posts_clauses', array($product_query, 'add_query_clauses'), 10, 2);
		add_filter('posts_pre_query', '__return_empty_array');

		$query_args                   = $product_query->prepare_objects_query($request);
		$query_args['no_found_rows']  = true;
		$query_args['posts_per_page'] = -1;
		$query                        = new \WP_Query();
		$result                       = $query->query($query_args);
		$product_query_sql            = $query->request;

		remove_filter('posts_clauses', array($product_query, 'add_query_clauses'), 10);
		remove_filter('posts_pre_query', '__return_empty_array');

		$price_filter_sql = "
			SELECT min( min_price ) as min_price, MAX( max_price ) as max_price
			FROM {$wpdb->wc_product_meta_lookup}
			WHERE product_id IN ( {$product_query_sql} )
		";

		return $wpdb->get_row($price_filter_sql); // phpcs:ignore
	}

	/**
	 * Get stock status counts for the current products.
	 *
	 * @param  \WP_REST_Request  $request  The request object.
	 *
	 * @return array status=>count pairs.
	 */
	public function get_stock_status_counts($request)
	{
		global $wpdb;
		$product_query         = new ProductQuery();
		$stock_status_options  = array('instock', 'outofstock', 'onbackorder');
		$hide_outofstock_items = get_option('woocommerce_hide_out_of_stock_items');
		if ('yes' === $hide_outofstock_items) {
			unset($stock_status_options['outofstock']);
		}

		add_filter('posts_clauses', array($product_query, 'add_query_clauses'), 10, 2);
		add_filter('posts_pre_query', '__return_empty_array');

		$query_args = $product_query->prepare_objects_query($request);
		unset($query_args['stock_status']);
		$query_args['no_found_rows']  = true;
		$query_args['posts_per_page'] = -1;
		$query                        = new \WP_Query();
		$result                       = $query->query($query_args);
		$product_query_sql            = $query->request;

		remove_filter('posts_clauses', array($product_query, 'add_query_clauses'), 10);
		remove_filter('posts_pre_query', '__return_empty_array');

		$stock_status_counts = array();

		foreach ($stock_status_options as $status) {
			$stock_status_count_sql = $this->generate_stock_status_count_query(
				$status,
				$product_query_sql,
				$stock_status_options
			);

			$result                       = $wpdb->get_row($stock_status_count_sql); // phpcs:ignore
			$stock_status_counts[$status] = $result->status_count;
		}

		return $stock_status_counts;
	}

	/**
	 * Generate calculate query by stock status.
	 *
	 * @param  string  $status  status to calculate.
	 * @param  string  $product_query_sql  product query for current filter state.
	 * @param  array  $stock_status_options  available stock status options.
	 *
	 * @return false|string
	 */
	private function generate_stock_status_count_query($status, $product_query_sql, $stock_status_options)
	{
		if ( ! in_array($status, $stock_status_options, true)) {
			return false;
		}
		global $wpdb;

		return "
			SELECT COUNT( DISTINCT posts.ID ) as status_count
			FROM {$wpdb->posts} as posts
			INNER JOIN {$wpdb->postmeta} as postmeta ON posts.ID = postmeta.post_id
            AND postmeta.meta_key = '_stock_status'
            AND postmeta.meta_value = '{$status}'
			WHERE posts.ID IN ( {$product_query_sql} )
		";
	}

	/**
	 * Get category counts for the current products.
	 *
	 * @param  \WP_REST_Request  $request  The request object.
	 *
	 * @return array termId=>count pairs.
	 */
	public function get_category_counts($request)
	{
		global $wpdb;

		// Remove paging and sorting params from the request.
		$request->set_param('page', null);
		$request->set_param('per_page', null);
		$request->set_param('order', null);
		$request->set_param('orderby', null);

		// Grab the request from the WP Query object, and remove SQL_CALC_FOUND_ROWS and Limits so we get a list of all products.
		$product_query = new ProductQuery();

		add_filter('posts_clauses', array($product_query, 'add_query_clauses'), 10, 2);
		add_filter('posts_pre_query', '__return_empty_array');

		$query_args = $product_query->prepare_objects_query($request);
		foreach ($query_args as $key => $args) {
			if ($key == 'tax_query') {
				foreach ($args as $index => $value) {
					if ($value['taxonomy'] == 'product_cat') {
						unset($query_args['tax_query'][$index]);
					}
				}
			}
		}
		$query_args['no_found_rows']  = true;
		$query_args['posts_per_page'] = -1;
		$query                        = new \WP_Query();
		$result                       = $query->query($query_args);
		$product_query_sql            = $query->request;

		remove_filter('posts_clauses', array($product_query, 'add_query_clauses'), 10);
		remove_filter('posts_pre_query', '__return_empty_array');

		$category_count_sql = "
			SELECT COUNT( DISTINCT posts.ID ) as cat_count, terms.term_id as cat_count_id, term_taxonomy.parent AS cat_parent
			FROM {$wpdb->posts} AS posts
			INNER JOIN {$wpdb->term_relationships} AS term_relationships ON posts.ID = term_relationships.object_id
			INNER JOIN {$wpdb->term_taxonomy} AS term_taxonomy USING( term_taxonomy_id )
			INNER JOIN {$wpdb->terms} AS terms USING( term_id )
			WHERE posts.ID IN ( {$product_query_sql} ) AND term_taxonomy.taxonomy IN ('product_cat')
			GROUP BY terms.term_id
		";

		$results       = $wpdb->get_results($category_count_sql); // phpcs:ignore
		$id_count_map  = array_map('absint', wp_list_pluck($results, 'cat_count', 'cat_count_id'));
		$id_parent_map = array_map('absint', wp_list_pluck($results, 'cat_parent', 'cat_count_id'));

		//calculate counts
		foreach ($id_count_map as $id => $count) {
			$cat_childes = $this->get_cat_childes($id, $id_parent_map, []);
			if( empty( $cat_childes ) ){
				continue;
			}
			foreach ($cat_childes as $child_id) {
				$id_count_map[$id] += $id_count_map[$child_id];
			}
		}

		//fill empty parents
		foreach ($id_parent_map as $cat_id => $parent_id) {
			if ( ! array_key_exists( $parent_id, $id_parent_map )) {
				$parents = get_ancestors($cat_id, 'product_cat', 'taxonomy');
				if ( ! empty($parents)) {
					for ($i = 0; $i < count($parents); $i++) {

						$id_count_map[ $parents[$i] ] += $id_count_map[ $cat_id ];
					}
				}
			}
		}

		return $id_count_map;
	}

	public function get_cat_childes($cat_id, $id_parent_map, $founded_childes)
	{
		foreach ($id_parent_map as $id => $parent_id) {
			if ($parent_id == $cat_id) {
				$founded_childes[] = $id;
				$founded_childes   = $this->get_cat_childes($id, $id_parent_map, $founded_childes);
			}
		}

		return $founded_childes;
	}

	/**
	 * Get attribute counts for the current products.
	 *
	 * @param  \WP_REST_Request  $request  The request object.
	 * @param  array  $attributes  Attributes to count, either names or ids.
	 *
	 * @return array termId=>count pairs.
	 */
	public function get_attribute_counts($request, $attributes = [])
	{
		global $wpdb;

		// Remove paging and sorting params from the request.
		$request->set_param('page', null);
		$request->set_param('per_page', null);
		$request->set_param('order', null);
		$request->set_param('orderby', null);

		// Grab the request from the WP Query object, and remove SQL_CALC_FOUND_ROWS and Limits so we get a list of all products.
		$product_query = new ProductQuery();

		add_filter('posts_clauses', array($product_query, 'add_query_clauses'), 10, 2);
		add_filter('posts_pre_query', '__return_empty_array');

		$query_args                   = $product_query->prepare_objects_query($request);
		$query_args['no_found_rows']  = true;
		$query_args['posts_per_page'] = -1;
		$query                        = new \WP_Query();
		$result                       = $query->query($query_args);
		$product_query_sql            = $query->request;

		remove_filter('posts_clauses', array($product_query, 'add_query_clauses'), 10);
		remove_filter('posts_pre_query', '__return_empty_array');

		if (count($attributes) === count(array_filter($attributes, 'is_numeric'))) {
			$attributes = array_map('wc_attribute_taxonomy_name_by_id', wp_parse_id_list($attributes));
		}

		$attributes_to_count     = array_map(
			function( $attribute ) {
				$attribute = wc_sanitize_taxonomy_name( $attribute );
				return esc_sql( $attribute );
			},
			$attributes
		);
		$attributes_to_count_sql = 'AND term_taxonomy.taxonomy IN ("' . implode( '","', $attributes_to_count ) . '")';
		$attribute_count_sql     = "
			SELECT COUNT( DISTINCT posts.ID ) as term_count, terms.term_id as term_count_id
			FROM {$wpdb->posts} AS posts
			INNER JOIN {$wpdb->term_relationships} AS term_relationships ON posts.ID = term_relationships.object_id
			INNER JOIN {$wpdb->term_taxonomy} AS term_taxonomy USING( term_taxonomy_id )
			INNER JOIN {$wpdb->terms} AS terms USING( term_id )
			WHERE posts.ID IN ( {$product_query_sql} )
			{$attributes_to_count_sql}
			GROUP BY terms.term_id
		";

		$results = $wpdb->get_results($attribute_count_sql); // phpcs:ignore

		return array_map('absint', wp_list_pluck($results, 'term_count', 'term_count_id'));
	}

	/**
	 * Get rating counts for the current products.
	 *
	 * @param  \WP_REST_Request  $request  The request object.
	 *
	 * @return array rating=>count pairs.
	 */
	public function get_rating_counts($request)
	{
		global $wpdb;

		// Regenerate the products query without rating request params.
		unset($request['rating']);

		// Grab the request from the WP Query object, and remove SQL_CALC_FOUND_ROWS and Limits so we get a list of all products.
		$product_query = new ProductQuery();

		add_filter('posts_clauses', array($product_query, 'add_query_clauses'), 10, 2);
		add_filter('posts_pre_query', '__return_empty_array');

		$query_args                   = $product_query->prepare_objects_query($request);
		$query_args['no_found_rows']  = true;
		$query_args['posts_per_page'] = -1;
		$query                        = new \WP_Query();
		$result                       = $query->query($query_args);
		$product_query_sql            = $query->request;

		remove_filter('posts_clauses', array($product_query, 'add_query_clauses'), 10);
		remove_filter('posts_pre_query', '__return_empty_array');

		$rating_count_sql = "
			SELECT COUNT( DISTINCT product_id ) as product_count, ROUND( average_rating, 0 ) as rounded_average_rating
			FROM {$wpdb->wc_product_meta_lookup}
			WHERE product_id IN ( {$product_query_sql} )
			AND average_rating > 0
			GROUP BY rounded_average_rating
			ORDER BY rounded_average_rating ASC
		";

		$results = $wpdb->get_results($rating_count_sql); // phpcs:ignore

		return array_map('absint', wp_list_pluck($results, 'product_count', 'rounded_average_rating'));
	}
}
