import * as React from 'react'
import styles from './_DeploymentsScreen.module.css';
import deploymentsLoader from './deployments.loader';
import { ScreenProps } from '../../types';
import { Button, ButtonList, DropDownButton, ScreenWrapper, Spinner, Table, Card, Modal, ModalBox } from '../../components';
import { DBBotDeployment } from '../../../../lambdas/model.types';
import { TableColumn } from '../../components/table/Table';
import apiCacher from '../../state/apiCacher';
import Toaster from '../../components/toaster/Toaster';
import CreateDeploymentForm, { CreateDeploymentPayload } from './CreateDeploymentForm';


export default class DeploymentsScreen extends React.Component<ScreenProps> {
	state = {
		loadingItems: {},
		createModalOpen: false
	}

	render() {
		return (
			<ScreenWrapper title="Deployments" titleExtra={ this.renderCreateButton() } >
				{ this.renderDeployments() }
				{ this.renderCreateModal() }
			</ScreenWrapper>
		);
	}

	renderCreateButton() {
		return (
			<Button size="s"
				onClick={ () => this.setState({createModalOpen: true}) }>
				Create new deployment
			</Button>
		);
	}

	renderDeployments() {
		const { data, isLoading } = deploymentsLoader.getData(this, this.props.store.authenticatedId);

		if( isLoading || !data ) return 'Loading...';

		return (
			<Table
				data={ data }
				keyField="id"
				columns={ this.getColumns() }
				disabledItems={ this.state.loadingItems }
				noElementsMessage={ this.renderNoElements() }
			/>
		);
	}

	renderNoElements() {
		return (
			<Card>
				No deployments yet.
			</Card>
		)
	}

	renderCreateModal() {
		return (
			<Modal open={this.state.createModalOpen}
				onClose={() => this.setState({ createModalOpen: false })}>
				{() => (
					<ModalBox>
						<CreateDeploymentForm
							accountId={this.props.store.authenticatedId}
							onClose={() => this.setState({ createModalOpen: false })}
							onCreate={this._onCreateDeployment} />
					</ModalBox>
				)}
			</Modal>
		)
	}

	getColumns(): TableColumn<DBBotDeployment>[] {
		return [
			{ field: 'id' },
			{ field: 'botId' },
			{ field: 'active', title: '', renderFn: this._renderActive },
			{ field: 'controls', title: '', renderFn: this._renderControls, noSort: true }
		];
	}

	_renderActive = (item: DBBotDeployment) => {
		return <span>{item.active ? 'Active' : 'Inactive'}</span>;
	}

	_renderControls = (item: DBBotDeployment) => {
		// @ts-ignore
		if (this.state.loadingItems[item.id]) {
			return <Spinner color="#fff" />;
		}

		let buttons = [
			{
				label: item.active ? 'Deactivate' : 'Activate',
				value: item.active ? 'deactivate' : 'activate'
			},
			{ label: 'Delete this deployment', value: 'delete' }
		];

		return (
			<DropDownButton closeOnClick={true}>
				<ButtonList buttons={buttons}
					onButtonPress={(action: string) => this._onExchangeAction(item, action)}
				/>
			</DropDownButton>
		);
	}

	_onExchangeAction = (item: DBBotDeployment, action: string) => {
		const {authenticatedId} = this.props.store;
		if( action === 'activate' ){
			this.setState({loadingItems: {[item.id]: true}});
			apiCacher.updateDeployment( item.id, {active: true, accountId: authenticatedId})
				.then( () => {
					this.setState({loadingItems: {}});
				})
			;
		}
		else if (action === 'deactivate') {
			this.setState({ loadingItems: { [item.id]: true } });
			apiCacher.updateDeployment(item.id, { active: false, accountId: authenticatedId })
				.then(() => {
					this.setState({ loadingItems: {} });
				})
			;
		}
		else if (action === 'delete') {
			this.setState({ loadingItems: { [item.id]: true } });
			apiCacher.deleteDeployment(authenticatedId, item.id)
				.then(() => {
					this.setState({ loadingItems: {} });
				})
			;
		}
	}

	_onCreateDeployment = ( data: CreateDeploymentPayload ) => {
		return apiCacher.createDeployment( data ).then( res => {
			if( !res.data?.error ){
				this.setState({createModalOpen: false});
				Toaster.show('The bot has been deployed', 'success');
			}
		});
	}
}
