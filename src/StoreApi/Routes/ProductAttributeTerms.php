<?php
namespace Automattic\WooCommerce\Blocks\StoreApi\Routes;

use Automattic\WooCommerce\Blocks\StoreApi\Utilities\Pagination;
use WP_Term_Query;

/**
 * ProductAttributeTerms class.
 *
 * @internal This API is used internally by Blocks--it is still in flux and may be subject to revisions.
 */
class ProductAttributeTerms extends AbstractTermsRoute {
	/**
	 * Get the path of this REST route.
	 *
	 * @return string
	 */
	public function get_path() {
		return '/products/attributes/(?P<attribute_id>[\d]+)/terms';
	}

	/**
	 * Get method arguments for this REST route.
	 *
	 * @return array An array of endpoints.
	 */
	public function get_args() {
		return [
			'args'   => array(
				'attribute_id' => array(
					'description' => __( 'Unique identifier for the attribute.', 'woo-gutenberg-products-block' ),
					'type'        => 'integer',
				),
			),
			[
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => [ $this, 'get_response' ],
				'permission_callback' => '__return_true',
				'args'                => $this->get_collection_params(),
			],
			'schema' => [ $this->schema, 'get_public_item_schema' ],
		];
	}

	/**
	 * Get the query params for collections of attributes.
	 *
	 * @return array
	 */
	public function get_collection_params() {
		return array_merge(
			parent::get_collection_params(),
			[
				'include_metadata' => [
					'description'       => __( 'Term additional metadata to include in response.', 'woo-gutenberg-products-block' ),
					'type'              => 'string',
					'default'           => '',
					'sanitize_callback' => 'sanitize_text_field',
					'validate_callback' => 'rest_validate_request_arg',
				],
				'meta_key'         => [ // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
					'description'       => __( 'Limit terms to those matching a specific metadata key.', 'woo-gutenberg-products-block' ),
					'type'              => 'string',
					'default'           => '',
					'sanitize_callback' => 'sanitize_text_field',
					'validate_callback' => 'rest_validate_request_arg',
				],
				'meta_value'       => [ // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
					'description'       => __( 'Limit terms to those matching a specific metadata value.', 'woo-gutenberg-products-block' ),
					'type'              => 'string',
					'default'           => '',
					'sanitize_callback' => 'sanitize_text_field',
					'validate_callback' => 'rest_validate_request_arg',
				],
				'meta_compare'     => [
					'description'       => __( 'Comparison operator to test the "meta_value".', 'woo-gutenberg-products-block' ),
					'type'              => 'string',
					'default'           => '',
					'sanitize_callback' => 'sanitize_text_field',
					'validate_callback' => 'rest_validate_request_arg',
				],
			]
		);
	}

	/**
	 * Get terms matching passed in args.
	 *
	 * @param  string           $taxonomy  Taxonomy to get terms from.
	 * @param  \WP_REST_Request $request  Request object.
	 *
	 * @return \WP_REST_Response
	 */
	protected function get_terms_response( $taxonomy, $request ) {
		$page          = (int) $request['page'];
		$per_page      = $request['per_page'] ? (int) $request['per_page'] : 0;
		$prepared_args = array(
			'taxonomy'     => $taxonomy,
			'exclude'      => $request['exclude'],
			'include'      => $request['include'],
			'order'        => $request['order'],
			'orderby'      => $request['orderby'],
			'hide_empty'   => (bool) $request['hide_empty'],
			'number'       => $per_page,
			'offset'       => $per_page > 0 ? ( $page - 1 ) * $per_page : 0,
			'search'       => $request['search'],
			'meta_key'     => $request['meta_key'], // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
			'meta_value'   => $request['meta_value'], // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
			'meta_compare' => $request['meta_compare'],
		);

		$term_query = new WP_Term_Query();
		$objects    = $term_query->query( $prepared_args );
		$return     = [];

		foreach ( $objects as $object ) {
			$data = $this->prepare_item_for_response( $object, $request );
			if ( ! empty( $request['include_metadata'] ) ) {
				$tmp_data             = $data->get_data();
				$tmp_data['metadata'] = [];

				$term_metas        = get_term_meta( $object->term_id );
				$required_metadata = explode( ',', preg_replace( '/\s+/', '', $request['include_metadata'] ) );
				foreach ( $required_metadata as $key ) {
					$tmp_data['metadata'][ $key ] = isset( $term_metas[ $key ] ) ? $term_metas[ $key ][0] : null;
				}
				$data->set_data( $tmp_data );
			}
			$return[] = $this->prepare_response_for_collection( $data );
		}

		$response = rest_ensure_response( $return );

		// See if pagination is needed before calculating.
		if ( $per_page > 0 && ( count( $objects ) === $per_page || $page > 1 ) ) {
			$term_count = $this->get_term_count( $taxonomy, $prepared_args );
			$response   = ( new Pagination() )->add_headers(
				$response,
				$request,
				$term_count,
				ceil( $term_count / $per_page )
			);
		}

		return $response;
	}

	/**
	 * Get a collection of attribute terms.
	 *
	 * @throws RouteException On error.
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	protected function get_route_response( \WP_REST_Request $request ) {
		$attribute = wc_get_attribute( $request['attribute_id'] );

		if ( ! $attribute || ! taxonomy_exists( $attribute->slug ) ) {
			throw new RouteException( 'woocommerce_rest_taxonomy_invalid', __( 'Attribute does not exist.', 'woo-gutenberg-products-block' ), 404 );
		}

		return $this->get_terms_response( $attribute->slug, $request );
	}
}
