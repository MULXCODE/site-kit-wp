/**
 * External dependencies
 */
import { storiesOf } from '@storybook/react';

/**
 * Internal dependencies
 */
import Menu from '../assets/js/components/Menu';

storiesOf( 'Global', module )
	.add( 'Menu', () => (
		<div>
			<div>
				<p>Menu</p>
				<Menu
					menuOpen
					menuItems={ [
						'Menu 1',
						'Menu 2',
						'Menu 3',
						'Menu 4',
						'Menu 5',
					] }
					onSelected={ ( index ) => {
						global.console.log( index );
					} }
					id="googlesitekit-menu"
				/>
			</div>
		</div>
	), {
		options: {
			onReadyScript: 'mouse.js',
		},
	} );
