/**
 * User Input Preview.
 *
 * Site Kit by Google, Copyright 2021 Google LLC
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
 * External dependencies
 */
import PropTypes from 'prop-types';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import Data from 'googlesitekit-data';
import { CORE_USER } from '../../googlesitekit/datastore/user/constants';
import { Cell, Row } from '../../material-components';
import Button from '../Button';
import UserInputPreviewGroup from './UserInputPreviewGroup';
import UserInputQuestionNotice from './UserInputQuestionNotice';
import { getUserInputAnwsers } from './util/constants';
import ErrorNotice from '../ErrorNotice';
const { useSelect } = Data;

export default function UserInputPreview( props ) {
	const {
		noFooter,
		back,
		goTo,
		submitChanges,
		error,
	} = props;

	const settings = useSelect( ( select ) => select( CORE_USER ).getUserInputSettings() );

	const {
		USER_INPUT_ANSWERS_GOALS,
		USER_INPUT_ANSWERS_HELP_NEEDED,
		USER_INPUT_ANSWERS_POST_FREQUENCY,
		USER_INPUT_ANSWERS_ROLE,
	} = getUserInputAnwsers();

	return (
		<div className="googlesitekit-user-input__preview">
			<Row>
				<Cell lgSize={ 12 } mdSize={ 8 } smSize={ 4 }>
					<Fragment>
						<Row>
							<Cell lgSize={ 6 } mdSize={ 8 } smSize={ 4 }>
								<UserInputPreviewGroup
									questionNumber={ 1 }
									title={ __( 'Which best describes your team/role relation to this site?', 'google-site-kit' ) }
									edit={ goTo.bind( null, 1, 'user-input' ) }
									values={ settings?.role?.values || [] }
									options={ USER_INPUT_ANSWERS_ROLE }
								/>

								<UserInputPreviewGroup
									questionNumber={ 2 }
									title={ __( 'How often do you create new posts for this site?', 'google-site-kit' ) }
									edit={ goTo.bind( null, 2, 'user-input' ) }
									values={ settings?.postFrequency?.values || [] }
									options={ USER_INPUT_ANSWERS_POST_FREQUENCY }
								/>

								<UserInputPreviewGroup
									questionNumber={ 3 }
									title={ __( 'What are the goals of this site?', 'google-site-kit' ) }
									edit={ goTo.bind( null, 3, 'user-input' ) }
									values={ settings?.goals?.values || [] }
									options={ USER_INPUT_ANSWERS_GOALS }
								/>
							</Cell>
							<Cell lgSize={ 6 } mdSize={ 8 } smSize={ 4 }>
								<UserInputPreviewGroup
									questionNumber={ 4 }
									title={ __( 'What do you need help most with for this site?', 'google-site-kit' ) }
									edit={ goTo.bind( null, 4, 'user-input' ) }
									values={ settings?.helpNeeded?.values || [] }
									options={ USER_INPUT_ANSWERS_HELP_NEEDED }
								/>

								<UserInputPreviewGroup
									questionNumber={ 5 }
									title={ __( 'To help us identify opportunities for your site, enter the top three search terms that you’d like to show up for:', 'google-site-kit' ) }
									edit={ goTo.bind( null, 5, 'user-input' ) }
									values={ settings?.searchTerms?.values || [] }
								/>
							</Cell>
						</Row>

						{ error && <ErrorNotice error={ error } /> }

						{ ! noFooter && (
							<div className="googlesitekit-user-input__preview--footer">
								<UserInputQuestionNotice />

								<div className="googlesitekit-user-input__buttons">
									<Button
										className="googlesitekit-user-input__buttons--back"
										onClick={ back }
										text
									>
										{ __( 'Back', 'google-site-kit' ) }
									</Button>
									<Button
										className="googlesitekit-user-input__buttons--next"
										onClick={ submitChanges }
									>
										{ __( 'Submit', 'google-site-kit' ) }
									</Button>
								</div>
							</div>
						) }
					</Fragment>
				</Cell>
			</Row>
		</div>
	);
}

UserInputPreview.propTypes = {
	submitChanges: PropTypes.func,
	noFooter: PropTypes.bool,
	back: PropTypes.func,
	goTo: PropTypes.func.isRequired,
	redirectURL: PropTypes.string,
	errors: PropTypes.object,
};
