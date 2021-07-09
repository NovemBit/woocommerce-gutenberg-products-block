<?php
namespace Automattic\WooCommerce\Blocks\BlockTypes;

/**
 * ColorAttributeFilter class.
 */
class ColorAttributeFilter extends AbstractBlock {
	/**
	 * Block name.
	 *
	 * @var string
	 */
	protected $block_name = 'color-attribute-filter';

	/**
	 * Extra data passed through from server to client for block.
	 *
	 * @param array $attributes  Any attributes that currently are available from the block.
	 *                           Note, this will be empty in the editor context when the block is
	 *                           not in the post content on editor load.
	 */
	protected function enqueue_data( array $attributes = [] ) {
		parent::enqueue_data( $attributes );
		$this->asset_data_registry->add( 'attributes', array_values( wc_get_attribute_taxonomies() ), true );
	}

	protected function register_block_type()
	{
		parent::register_block_type();

		add_action( 'created_term', [$this, 'handleTermSaveRequest'], 1, 3 );
		add_action( 'edit_term', [$this, 'handleTermSaveRequest'], 1, 3 );
		add_action( $this->getTaxonomyName() . '_add_form_fields', array( $this, 'renderAddForm' ), 10, 1 );
		add_action( $this->getTaxonomyName() . '_edit_form', array( $this, 'renderEditForm' ), 10, 1 );
	}

	/**
	 * Get taxonomy name
	 * @return string
	 */
	private function getTaxonomyName(): string
	{
		return 'pa_color';
	}

	/**
	 * Render fields in term add screen
	 */
	public function renderAddForm()
	{
		?><div class="form-field">
			<label for="color_code"><?php _e('Color Code', 'woo-gutenberg-products-block') ?></label>
			<input type="text" name="color_code" id="color_code" value="" size="40">
		</div><?php
	}

	/**
	 * Render fields in term edit screen
	 * @param  \WP_Term  $term  Term instance
	 */
	public function renderEditForm(\WP_Term $term): void
	{
		?>
		<table class="form-table" role="presentation">
			<tbody>
				<tr class="form-field">
					<th scope="row">
						<label for="color_code"><?php _e('Color Code', 'woo-gutenberg-products-block'); ?></label>
					</th>
					<td>
						<input type="text" name="color_code" value="<?php echo get_term_meta($term->term_id, 'color', true); ?>">
					</td>
				</tr>
			</tbody>
		</table>
		<?php
	}

	/**
	 * Save term metadata
	 * @hooked in "created_term", "edit_term" actions
	 * @param  int  $term_id  Term ID
	 * @param  int  $tt_id  Term taxonomy ID
	 * @param  string  $taxonomy  Taxonomy name
	 */
	public function handleTermSaveRequest(int $term_id, int $tt_id, string $taxonomy): void
	{
		if (('pa_color' === $taxonomy) && isset($_POST['color_code'])) {
			update_term_meta($term_id, 'color', sanitize_text_field($_POST['color_code']));
		}
	}
}
