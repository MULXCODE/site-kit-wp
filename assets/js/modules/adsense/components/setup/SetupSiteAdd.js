/**
 * AdSense Setup Site Add component.
 *
 * Site Kit by Google, Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * WordPress dependencies
 */
import { Fragment, useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Data from 'googlesitekit-data';
import Button from '../../../../components/Button';
import { STORE_NAME } from '../../datastore/constants';
import { ErrorNotices } from '../common';
const { useSelect } = Data;

export default function SetupSiteAdd() {
	const accountID = useSelect( ( select ) => select( STORE_NAME ).getAccountID() );
	const addSiteURL = useSelect( ( select ) => select( STORE_NAME ).getServiceAccountManageSiteURL() );

	const addSiteHandler = useCallback( ( event ) => {
		event.preventDefault();
		global.open( addSiteURL, '_blank' );
	}, [ addSiteURL ] );

	if ( ! accountID || ! addSiteURL ) {
		return null;
	}

	return (
		<Fragment>
			<h3 className="googlesitekit-heading-4 googlesitekit-setup-module__title">
				{ __( 'Add site to your AdSense account', 'google-site-kit' ) }
			</h3>

			<ErrorNotices />

			<p>
				{ __( 'We’ve detected that you haven’t added this site to your AdSense account yet.', 'google-site-kit' ) }
			</p>

			<div className="googlesitekit-setup-module__action">
				<Button
					onClick={ addSiteHandler }
					href={ addSiteURL }
				>
					{ __( 'Add site to AdSense', 'google-site-kit' ) }
				</Button>
			</div>
		</Fragment>
	);
}
